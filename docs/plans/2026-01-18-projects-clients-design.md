# Projects & Clients System Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

The Projects & Clients System provides the organizational backbone for all AV design work. Every project belongs to a client, and clients can be hierarchical (parent companies with subsidiaries).

**Core Relationships:**

```
Organization
├── Templates (org-wide defaults)
└── Clients[] (hierarchical)
    ├── Parent Client
    │   ├── Client Info & Contacts
    │   ├── Pricing Agreements
    │   ├── Templates (override org defaults)
    │   ├── Learned Patterns
    │   └── Subsidiary Clients[]
    └── Projects[]
        ├── Project Info & Status
        ├── Assigned Contacts (from client)
        ├── Workstreams & Tasks
        ├── Location Hierarchy (flexible nesting)
        │   └── Rooms[]
        │       ├── Equipment & Connections
        │       └── Drawings
        └── Quotes (flexible scope)
```

**Key Principles:**
- Every project belongs to exactly one client (required)
- Clients can be hierarchical (parent companies with subsidiaries)
- Projects have flexible internal hierarchy (user defines depth)
- Single owner per project with transfer capability
- Configurable visibility per project (private, client-team, organization)
- Templates cascade: Organization → Client → Project
- Pricing cascades: Standard → Client overrides

---

## Client Data Model

```typescript
interface Client {
  id: string;
  name: string;
  parentId: string | null;        // For hierarchy (null = top-level)

  // Company Info
  industry: string;               // e.g., "Healthcare", "Finance", "Education"
  website: string;
  logoUrl: string;

  // Address
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Billing
  billing: {
    contactId: string;            // Reference to billing contact
    terms: string;                // e.g., "Net 30"
    taxExempt: boolean;
    taxExemptId: string;
  };

  // Contacts (master list for this client)
  contacts: ClientContact[];

  // Pricing
  priceBook: PriceBookEntry[];    // Equipment-level overrides

  // Templates & Patterns
  templates: string[];            // IDs of client-specific templates
  learnedPatterns: LearnedPatternSet;  // From ingested designs

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ClientContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  tags: string[];                 // Flexible: "billing", "technical", "decision-maker", etc.
  notes: string;
  isPrimary: boolean;
}

interface PriceBookEntry {
  equipmentId: string;
  overridePrice: number;          // Client-specific price
  discountPercent: number;        // Or percentage off standard
  effectiveDate: string;
  expirationDate: string | null;
  notes: string;                  // e.g., "Per MSA dated 2025-06-01"
}
```

### Client Hierarchy Rules

- Subsidiaries inherit parent's templates and patterns (can override)
- Subsidiaries inherit parent's price book (can override at equipment level)
- Projects can be created at any level (parent or subsidiary)
- Contacts are per-client (not inherited)

### Price Resolution Order

1. Client price book (equipment-level override)
2. Parent client price book (if subsidiary)
3. Standard equipment pricing

---

## Project Data Model

```typescript
interface Project {
  id: string;
  clientId: string;               // Required - every project has a client

  // Basic Info
  name: string;
  projectNumber: string;          // e.g., "PRJ-2026-0042"
  description: string;

  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  accessInstructions: string;     // "Check in at front desk, ask for Bob"

  // Financials
  contractValue: number;
  purchaseOrders: PurchaseOrder[];
  billingMilestones: BillingMilestone[];

  // Ownership & Visibility
  ownerId: string;
  visibility: 'private' | 'client_team' | 'organization';

  // Status
  pipelineStatus: PipelineStatus;
  workstreams: Workstream[];

  // Contacts (assigned from client's contact list)
  assignedContacts: ProjectContact[];

  // Structure (flexible nesting)
  locations: LocationNode[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  amount: number;
  receivedDate: string;
  notes: string;
}

interface BillingMilestone {
  id: string;
  name: string;                   // e.g., "50% at design approval"
  amount: number;
  targetDate: string;
  actualDate: string | null;
  invoiceNumber: string | null;
  status: 'pending' | 'invoiced' | 'paid';
}

interface ProjectContact {
  contactId: string;              // Reference to client's contact
  role: string;                   // Role on this project: "Site Contact", "Approver"
}

type PipelineStatus =
  | 'lead'
  | 'proposal'
  | 'won'
  | 'lost'
  | 'design'
  | 'installation'
  | 'complete'
  | 'warranty';
```

### Pipeline Stages

| Stage | Description |
|-------|-------------|
| **Lead** | Initial opportunity identified |
| **Proposal** | Quote/proposal submitted to client |
| **Won** | Client accepted; project starting |
| **Lost** | Client declined or went elsewhere |
| **Design** | Active AV system design phase |
| **Installation** | Equipment ordered/installing |
| **Complete** | Project delivered and closed |
| **Warranty** | In warranty period; support active |

---

## Workstreams & Task Tracking

```typescript
interface Workstream {
  id: string;
  projectId: string;
  name: string;                   // "Design", "Procurement", "Installation"
  type: 'design' | 'procurement' | 'installation' | 'custom';
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  tasks: Task[];

  // Progress (calculated from tasks)
  completedTasks: number;
  totalTasks: number;
  percentComplete: number;
}

interface Task {
  id: string;
  workstreamId: string;

  // Content
  title: string;
  description: string;

  // Assignment
  assigneeId: string | null;

  // Dates
  dueDate: string | null;
  startDate: string | null;
  completedDate: string | null;

  // Status
  status: 'pending' | 'in_progress' | 'blocked' | 'complete';

  // Dependencies
  dependsOn: string[];            // Task IDs that must complete first
  blockedReason: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### Default Workstreams

Created automatically with new projects:

| Workstream | Default Tasks |
|------------|---------------|
| **Design** | Site survey, Room layouts, Equipment selection, Connection design, Drawing generation, Client review, Design approval |
| **Procurement** | BOM finalization, Quote approval, PO received, Equipment ordered, Equipment received, Staging/testing |
| **Installation** | Pre-wire, Rack build, Equipment install, Termination, Programming, Commissioning, Training, Punch list |

### Custom Workflows

- Clients can have custom workstream templates
- Custom tasks and task order per client
- When creating project for client, their workflow template is applied
- Owner can always add/modify tasks after creation

### Task Dependencies

- Tasks can depend on other tasks (within same or different workstream)
- Dependent tasks show as "blocked" until predecessors complete
- Visual dependency lines in timeline view

---

## Flexible Location Hierarchy

```typescript
interface LocationNode {
  id: string;
  projectId: string;
  parentId: string | null;        // null = top-level in project

  // Identity
  name: string;                   // "Building A", "Floor 2", "East Wing"
  locationType: string;           // User-defined: "building", "floor", "wing", "zone"

  // Optional details
  description: string;
  address: string | null;         // Override project address if different
  accessInstructions: string;

  // Order
  sortOrder: number;

  // Children
  children: LocationNode[];       // Nested locations
  rooms: string[];                // Room IDs at this level
}
```

### Example Hierarchies

```
Simple Project:
└── Conference Room A
└── Huddle Room 1
└── Boardroom

Campus Project:
└── Building A (building)
    └── Floor 1 (floor)
        └── Lobby (room)
        └── Conference 101 (room)
    └── Floor 2 (floor)
        └── Executive Suite (zone)
            └── Boardroom (room)
            └── Private Office (room)
└── Building B (building)
    └── Training Center (room)
```

### UI Behavior

- Drag-drop to reorganize hierarchy
- Right-click to add child location or room
- Collapse/expand nodes in tree view
- Bulk operations: move multiple rooms between locations
- Location type is freeform text (user names it)

### Room Assignment

- Rooms can exist at any level (directly under project or nested in locations)
- Moving a room updates its location context
- Room inherits access instructions from parent location (can override)

---

## Navigation & UI

### Projects View

**Two View Modes (toggle):**

#### Kanban Board

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    Lead     │  Proposal   │   Design    │Installation │  Complete   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │             │
│ │Acme HQ  │ │ │BigCo    │ │ │Smith Co │ │ │Jones Inc│ │             │
│ │$45,000  │ │ │Expansion│ │ │Tower    │ │ │Retrofit │ │             │
│ └─────────┘ │ │$120,000 │ │ │$85,000  │ │ └─────────┘ │             │
│             │ └─────────┘ │ └─────────┘ │             │             │
│             │ ┌─────────┐ │             │             │             │
│             │ │MegaCorp │ │             │             │             │
│             │ │Campus   │ │             │             │             │
│             │ └─────────┘ │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

- Drag cards between columns to change status
- Click card to open project detail
- Card shows: name, client, value, due date indicator

#### List View

| Project | Client | Status | Value | Due Date | Owner |
|---------|--------|--------|-------|----------|-------|
| Acme HQ Buildout | Acme Corp | Lead | $45,000 | Mar 15 | John |
| BigCo Expansion | BigCo Inc | Proposal | $120,000 | Apr 1 | Jane |

- Sortable columns
- Inline status editing
- Row click opens project detail

#### Filtering & Sorting

- Filter by: client, status, owner, date range, value range
- Sort by: name, client, status, value, due date, created date
- Quick filters: "My Projects", "Active", "Needs Attention"
- Search: project name, number, client name, location

---

### Clients View

**Two View Modes (toggle):**

#### Flat List

| Client | Parent | Industry | Projects | Total Value |
|--------|--------|----------|----------|-------------|
| Acme Corp | — | Finance | 12 | $1.2M |
| Acme West | Acme Corp | Finance | 4 | $340K |
| BigCo Inc | — | Healthcare | 8 | $890K |

#### Tree View

```
├── Acme Corp ($1.2M total)
│   ├── Acme West (4 projects)
│   ├── Acme East (5 projects)
│   └── Acme Central (3 projects)
├── BigCo Inc ($890K)
└── Smith Company ($450K)
```

- Expand/collapse parent clients
- Click to open client detail page
- Shows aggregate stats for parent (includes subsidiaries)

---

### Client Detail Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ Acme Corp                                            Edit  Archive  │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: Overview | Contacts | Projects | Pricing | Templates         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [Selected tab content]                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Tab | Content |
|-----|---------|
| **Overview** | Company info, address, billing terms, subsidiaries list, stats |
| **Contacts** | Contact list with tags, add/edit contacts |
| **Projects** | Filtered project list/kanban for this client only |
| **Pricing** | Price book editor, equipment-level overrides |
| **Templates** | Client-specific templates, learned patterns summary |

---

### Project Detail Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ Smith Tower AV Buildout                    Status: Design ▼  ●●●   │
│ Smith Company • PRJ-2026-0042                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: Overview | Rooms | Tasks | Quotes | Activity                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [Selected tab content]                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Tab | Content |
|-----|---------|
| **Overview** | Project info, contacts, financials, milestones, workstream progress bars |
| **Rooms** | Location tree with rooms, click room to enter Room Builder |
| **Tasks** | Workstream task lists, dependencies, Gantt-style timeline view |
| **Quotes** | Quote list for project, create new quote with scope selector |
| **Activity** | Activity feed with comments, events, audit trail |

---

## Integrations

### Quoting Integration

**Flexible Quote Scope:**

```typescript
interface Quote {
  id: string;
  projectId: string;

  // Scope definition
  scope: {
    type: 'room' | 'rooms' | 'location' | 'project';
    roomIds: string[];            // Specific rooms included
    locationId: string | null;    // If scoped to location
  };

  // Pricing uses client price book
  clientId: string;               // For price book lookup
  // ... rest of existing quote fields
}
```

**Scope Options:**
- Single room
- Multiple selected rooms
- All rooms in a location (and sub-locations)
- Entire project

### Templates Integration

**Template Application:**
- When creating room in project, user can select from:
  - Organization templates (available to all)
  - Client templates (learned patterns, saved templates)
- Client templates take precedence for defaults
- Project can specify "default template" for new rooms

### Notifications Integration

**Project Events (feed activity feed & notifications):**

| Event | Notification |
|-------|--------------|
| Project created | Owner notified |
| Status changed | Subscribers notified |
| Task assigned | Assignee notified |
| Task due soon | Assignee notified (3 days, 1 day before) |
| Task overdue | Assignee + owner notified |
| Task completed | Dependents unblocked; owner notified |
| Comment added | Subscribers notified |
| Quote approved | Owner + billing contact notified |
| Ownership transferred | Old + new owner notified |

**Subscription Model:**
- Owner auto-subscribed to all project events
- Task assignees subscribed to their task events
- Others can manually subscribe to projects
- Configurable per user: which events trigger notifications

---

## Activity Feed & Audit Log

```typescript
interface ActivityEvent {
  id: string;
  projectId: string;

  // What happened
  eventType: ActivityEventType;
  entityType: 'project' | 'room' | 'task' | 'quote' | 'drawing' | 'comment';
  entityId: string;

  // Who did it
  userId: string;

  // Details
  summary: string;                // "John changed status from Design to Installation"
  details: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];

  // Metadata
  timestamp: string;
}

type ActivityEventType =
  | 'created' | 'updated' | 'deleted'
  | 'status_changed' | 'owner_changed'
  | 'task_assigned' | 'task_completed'
  | 'comment_added'
  | 'quote_generated' | 'quote_approved'
  | 'drawing_generated' | 'drawing_exported'
  | 'room_added' | 'equipment_placed';
```

### Activity Feed UI

```
┌─────────────────────────────────────────────────────────────┐
│ Project Activity                                    Filter ▼│
├─────────────────────────────────────────────────────────────┤
│ ● Today                                                     │
│   Jane completed "Equipment ordered" in Procurement         │
│   2 hours ago                                               │
│                                                             │
│   John added Conference Room B to Floor 2                   │
│   4 hours ago                                               │
│                                                             │
│ ● Yesterday                                                 │
│   Quote Q-2026-0089 approved by client ($85,400)           │
│   Jane generated Electrical Line Diagram for Boardroom      │
│                                                             │
│ ● Jan 17                                                    │
│   Project status changed: Proposal → Won                    │
│   John added comment: "Kickoff meeting scheduled for..."    │
└─────────────────────────────────────────────────────────────┘
```

### Feed Features

- Filter by event type, user, date range
- Click event to navigate to relevant entity
- Comments inline in feed with reply capability
- Automatic grouping by day
- "Load more" pagination

### Audit vs Activity

| Aspect | Activity Feed | Audit Log |
|--------|---------------|-----------|
| **Audience** | Users | Admins |
| **Content** | Curated, user-friendly events | Complete system record |
| **Purpose** | Collaboration, awareness | Compliance, debugging |
| **Retention** | Configurable | Long-term archive |

---

## Database Schema

### clients table

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  logo_url TEXT,

  -- Address (JSONB for flexibility)
  address JSONB NOT NULL DEFAULT '{}',

  -- Billing
  billing_contact_id UUID,
  billing_terms TEXT DEFAULT 'Net 30',
  tax_exempt BOOLEAN DEFAULT false,
  tax_exempt_id TEXT,

  -- Templates & Patterns
  template_ids UUID[] DEFAULT '{}',
  learned_patterns JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_clients_parent ON clients(parent_id);
CREATE INDEX idx_clients_name ON clients(name);
```

### client_contacts table

```sql
CREATE TABLE client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
```

### client_price_book table

```sql
CREATE TABLE client_price_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  override_price DECIMAL(12,2),
  discount_percent DECIMAL(5,2),
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, equipment_id, effective_date)
);

CREATE INDEX idx_price_book_client ON client_price_book(client_id);
CREATE INDEX idx_price_book_equipment ON client_price_book(equipment_id);
```

### projects table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,

  -- Basic Info
  name TEXT NOT NULL,
  project_number TEXT UNIQUE,
  description TEXT,

  -- Location
  address JSONB NOT NULL DEFAULT '{}',
  access_instructions TEXT,

  -- Financials
  contract_value DECIMAL(12,2),

  -- Ownership & Visibility
  owner_id UUID NOT NULL REFERENCES users(id),
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'client_team', 'organization')),

  -- Status
  pipeline_status TEXT NOT NULL DEFAULT 'lead'
    CHECK (pipeline_status IN ('lead', 'proposal', 'won', 'lost',
           'design', 'installation', 'complete', 'warranty')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(pipeline_status);
```

### project_locations table

```sql
CREATE TABLE project_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_type TEXT,
  description TEXT,
  address JSONB,
  access_instructions TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_project ON project_locations(project_id);
CREATE INDEX idx_locations_parent ON project_locations(parent_id);
```

### workstreams table

```sql
CREATE TABLE workstreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom'
    CHECK (type IN ('design', 'procurement', 'installation', 'custom')),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workstreams_project ON workstreams(project_id);
```

### tasks table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workstream_id UUID NOT NULL REFERENCES workstreams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'blocked', 'complete')),
  blocked_reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_tasks_workstream ON tasks(workstream_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### task_dependencies table

```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON task_dependencies(depends_on_task_id);
```

### activity_events table

```sql
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  summary TEXT NOT NULL,
  details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON activity_events(project_id);
CREATE INDEX idx_activity_created ON activity_events(created_at DESC);
CREATE INDEX idx_activity_user ON activity_events(user_id);
```

---

## Implementation Phases

### Phase 1: Client Foundation
- Implement Client data model and CRUD
- Client list with flat/tree view toggle
- Client detail page with tabs
- Client contacts management

### Phase 2: Project Foundation
- Implement Project data model and CRUD
- Project list with kanban/list view toggle
- Project detail page with tabs
- Link projects to clients

### Phase 3: Location Hierarchy
- Implement LocationNode structure
- Tree UI with drag-drop reorganization
- Room assignment to locations
- Update existing Room model with location reference

### Phase 4: Workstreams & Tasks
- Implement Workstream and Task models
- Default workstream creation on project create
- Task management UI with dependencies
- Progress calculation and display

### Phase 5: Client Pricing
- Implement PriceBookEntry model
- Price book editor UI
- Integrate pricing into quote generation
- Price resolution with inheritance

### Phase 6: Activity & Notifications
- Implement ActivityEvent model
- Activity feed UI
- Connect to existing Notifications system
- Subscription management

### Phase 7: Advanced Features
- Custom workflow templates per client
- Billing milestones and PO tracking
- Project duplication
- Bulk operations

---

## Open Questions

1. **Project Numbering:** Auto-generate project numbers or user-defined? Format?
2. **Archived Projects:** Soft delete or separate archive? Retention policy?
3. **Client Merge:** How to handle merging duplicate clients or acquisitions?
4. **Multi-Currency:** Support for international clients with different currencies?
