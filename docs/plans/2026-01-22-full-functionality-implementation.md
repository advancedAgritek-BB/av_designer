# Full Functionality Implementation Plan

**Date:** 2026-01-22
**Status:** Draft - Pending Approval
**Scope:** Production deployment, feature completion, and bug fixes

---

## Executive Summary

AV Designer has a solid architectural foundation with 1700+ passing tests, comprehensive database schema (11 migrations), and properly structured React/TypeScript frontend with Tauri/Rust backend. However, the application cannot function in its current state due to missing infrastructure configuration and incomplete feature implementations.

This document outlines the work required to achieve full functionality across three priorities:

| Priority | Category | Effort | Impact |
|----------|----------|--------|--------|
| P1 | Make It Run | Medium | Critical - app won't work without this |
| P2 | Feature Completion | High | Important - features partially broken |
| P3 | Bug Fixes | Low | Quality - type safety and reliability |

**Total estimated scope:** ~45 files, ~2900 lines of changes

---

## Current State Analysis

### What's Working
- All service layers properly connect to Supabase
- React Query hooks correctly wired to services
- UI components render with proper loading/error/empty states
- 1700+ tests passing (code is architecturally sound)
- Rust backend for drawing generation and PDF export
- Database schema fully designed with RLS policies

### What's Blocking Functionality

| Blocker | Impact |
|---------|--------|
| No Supabase credentials configured | All API calls fail |
| No data in database | Empty screens everywhere |
| No authenticated user session | AuthGuard redirects to login |
| No seed data script | Can't test without manual entry |
| OAuth not implemented | Users expect Google/Microsoft login |

### Feature Completion Status

| Feature | Status | Gaps |
|---------|--------|------|
| Equipment Library | 100% | None |
| Standards Engine | 100% | None |
| Room Builder | 100% | None |
| Drawing Generation | 100% | None |
| Quoting System | 100% | None |
| Authentication | 90% | OAuth missing |
| Projects & Clients | 100% | None |
| Templates | 85% | Apply logic incomplete |
| Equipment Import | 75% | CSV only, weak errors |
| Notifications | 65% | Email delivery broken |

---

## Priority 1: Make It Run

### 1.1 Supabase Project Setup

**Objective:** Configure Supabase so the app can connect to a real database.

**Tasks:**

| Task | Owner | Details |
|------|-------|---------|
| Create Supabase Project | Manual | Dashboard → New Project → select region |
| Get Credentials | Manual | Settings → API → copy URL and anon key |
| Create `.env.local` | Dev | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Link Project | Dev | `supabase link --project-ref <ref>` |
| Push Migrations | Dev | `supabase db push` (deploys all 11 migrations) |
| Deploy Edge Functions | Dev | `supabase functions deploy` |
| Configure Auth Settings | Manual | Set site URL, redirect URLs in dashboard |

**Files affected:** None (external configuration)

---

### 1.2 Seed Data Script

**Objective:** Create script to populate database with test data for development and demos.

**New file:** `supabase/seed.sql`

**Seed data requirements:**

| Table | Records | Purpose |
|-------|---------|---------|
| `organizations` | 1 | Test organization |
| `equipment` | 50 | Sample AV equipment across all categories |
| `standard_nodes` | 10 | Folder hierarchy |
| `standards` | 5 | Sample standards |
| `rules` | 20 | Validation rules |
| `clients` | 3 | Sample clients |
| `projects` | 3 | Sample projects linked to clients |
| `rooms` | 5 | Sample rooms with placed equipment |
| `templates` | 5 | Starter templates (room, equipment package) |

**Equipment categories to seed:**
- Video: displays, cameras, video processors
- Audio: microphones, speakers, DSPs, amplifiers
- Control: touch panels, control processors
- Infrastructure: switchers, extenders, cables

**Sample seed structure:**
```sql
-- Equipment seed example
INSERT INTO equipment (id, manufacturer, model, sku, category, subcategory, description, cost, msrp, dimensions, organization_id)
VALUES
  (gen_random_uuid(), 'Poly', 'Studio X50', 'POLY-X50', 'video', 'video_bar', 'All-in-one video bar for small rooms', 2500.00, 3499.00, '{"width": 24, "height": 4, "depth": 5}', :org_id),
  (gen_random_uuid(), 'Shure', 'MXA920', 'SHURE-MXA920', 'audio', 'microphone', 'Ceiling array microphone', 3200.00, 4299.00, '{"width": 24, "height": 2, "depth": 24}', :org_id),
  -- ... more equipment
;
```

**Estimated scope:** 1 new file, ~300 lines

---

### 1.3 OAuth Integration

**Objective:** Add Google and Microsoft login options.

**Files to modify:**

| File | Changes |
|------|---------|
| `src/features/auth/auth-service.ts` | Add `signInWithGoogle()`, `signInWithMicrosoft()` methods |
| `src/features/auth/components/LoginPage.tsx` | Add OAuth buttons |
| `src/features/auth/components/SignupPage.tsx` | Add OAuth buttons |
| `supabase/config.toml` | Configure OAuth providers for local dev |

**New methods in auth-service.ts:**
```typescript
async signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw new AuthError(error.message, 'OAUTH_ERROR');
}

async signInWithMicrosoft(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile',
    },
  });
  if (error) throw new AuthError(error.message, 'OAUTH_ERROR');
}
```

**OAuth button component:**
```typescript
// src/features/auth/components/OAuthButtons.tsx
export function OAuthButtons() {
  const [loading, setLoading] = useState<'google' | 'microsoft' | null>(null);

  const handleGoogle = async () => {
    setLoading('google');
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      // Handle error
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="oauth-buttons">
      <Button
        variant="secondary"
        onClick={handleGoogle}
        loading={loading === 'google'}
        icon={<GoogleIcon />}
      >
        Continue with Google
      </Button>
      <Button
        variant="secondary"
        onClick={handleMicrosoft}
        loading={loading === 'microsoft'}
        icon={<MicrosoftIcon />}
      >
        Continue with Microsoft
      </Button>
    </div>
  );
}
```

**New file:** `src/pages/AuthCallbackPage.tsx` - Handle OAuth redirect

**External setup required:**
- Google Cloud Console: Create OAuth 2.0 credentials
- Azure AD: Register application
- Supabase Dashboard: Enable providers, add client IDs/secrets

**Estimated scope:** 4-5 files, ~200 lines

---

### 1.4 Environment Validation

**Objective:** Fail fast with clear error messages when configuration is missing.

**File:** `src/lib/supabase.ts`

**Current (problematic):**
```typescript
supabaseUrl || 'https://placeholder.supabase.co',
supabaseAnonKey || 'placeholder-key',
```

**Fixed:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing configuration.\n' +
    'Create .env.local with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://not-configured.supabase.co',
  supabaseAnonKey ?? 'not-configured',
);
```

**Update BackendGate.tsx** to use exported `isSupabaseConfigured` flag.

**Estimated scope:** 2 files, ~30 lines

---

### Priority 1 Summary

| Task | Files | Lines | Dependencies |
|------|-------|-------|--------------|
| Supabase Setup | 0 | 0 | External config |
| Seed Data Script | 1 | ~300 | Supabase setup |
| OAuth Integration | 5 | ~200 | Supabase setup + external |
| Environment Validation | 2 | ~30 | None |
| **Total** | **8** | **~530** | |

---

## Priority 2: Feature Completion

### 2.1 Templates Feature

**Current state:** 85% complete
**Objective:** Complete apply functionality with full equipment restoration

**Gaps to address:**

| Gap | Impact | Fix |
|-----|--------|-----|
| Equipment connections ignored | Cables not restored | Parse and create connections on apply |
| Mount type hardcoded to 'floor' | Wrong placement | Use template's mount type |
| No content preview | Users apply blind | Show equipment list before apply |
| No thumbnail generation | No visual reference | Screenshot canvas on save |
| No conflict detection | Broken applies | Validate equipment exists |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/features/templates/template-apply.ts` | Fix mount type (line 72), add connection restoration (lines 162-177) |
| `src/features/templates/components/ApplyTemplateModal.tsx` | Add content preview section |
| `src/features/templates/template-service.ts` | Add thumbnail upload on save |
| `src/features/templates/components/TemplateEditor.tsx` | Generate thumbnail from canvas |

**Connection restoration logic:**
```typescript
// In applyRoomTemplate()
if (template.content.connections && template.content.connections.length > 0) {
  const connectionMap = new Map<string, string>(); // old ID -> new ID

  // Map old equipment IDs to new ones
  template.content.equipment.forEach((eq, index) => {
    connectionMap.set(eq.id, createdEquipment[index].id);
  });

  // Create connections with new IDs
  const newConnections = template.content.connections.map(conn => ({
    ...conn,
    id: generateId(),
    sourceId: connectionMap.get(conn.sourceId) ?? conn.sourceId,
    targetId: connectionMap.get(conn.targetId) ?? conn.targetId,
  }));

  await roomService.updateConnections(roomId, newConnections);
}
```

**Content preview component:**
```typescript
// In ApplyTemplateModal.tsx
function TemplatePreview({ template }: { template: Template }) {
  const content = template.content as RoomTemplateContent;

  return (
    <div className="template-preview">
      <h4>Room Configuration</h4>
      <dl>
        <dt>Type</dt><dd>{content.roomType}</dd>
        <dt>Dimensions</dt><dd>{content.width}' × {content.length}'</dd>
        <dt>Platform</dt><dd>{content.platform}</dd>
      </dl>

      <h4>Equipment ({content.equipment.length} items)</h4>
      <ul>
        {content.equipment.map(eq => (
          <li key={eq.id}>{eq.label || eq.equipmentId}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Estimated scope:** 4-6 files, ~400 lines

---

### 2.2 Equipment Import Feature

**Current state:** 75% complete
**Objective:** Support multiple formats with robust error handling

**Gaps to address:**

| Gap | Impact | Fix |
|-----|--------|-----|
| CSV only | Limited usability | Add Excel (.xlsx) support |
| No tiered pricing | Missing price breaks | Extend pricing schema |
| Weak deduplication | Duplicates created | Fuzzy matching on import |
| Silent row skipping | Users confused | Detailed per-row errors |
| No partial recovery | All-or-nothing | Transaction with selective commit |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/features/equipment/import-service.ts` | Add Excel parsing, improve deduplication |
| `src/features/equipment/components/import/ImportWizard.tsx` | Format selector, better errors |
| `src/features/equipment/components/import/ImportPreview.tsx` | Validation summary |
| `src/features/equipment/components/import/RowEditor.tsx` | Enhanced inline editing |

**New dependency:**
```bash
npm install xlsx
```

**Excel parsing addition:**
```typescript
// In import-service.ts
import * as XLSX from 'xlsx';

export async function parseFile(file: File): Promise<ParsedRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(await file.text());
  }

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
    return mapToRows(data);
  }

  throw new ImportError(`Unsupported file format: ${extension}`);
}
```

**Fuzzy deduplication:**
```typescript
// Add to import-service.ts
import Fuse from 'fuse.js';

function findDuplicates(
  newItems: ImportRow[],
  existing: Equipment[]
): Map<number, Equipment> {
  const fuse = new Fuse(existing, {
    keys: ['manufacturer', 'model', 'sku'],
    threshold: 0.3, // Allow ~30% difference
  });

  const duplicates = new Map<number, Equipment>();

  newItems.forEach((item, index) => {
    const searchString = `${item.manufacturer} ${item.model} ${item.sku}`;
    const results = fuse.search(searchString);

    if (results.length > 0 && results[0].score! < 0.3) {
      duplicates.set(index, results[0].item);
    }
  });

  return duplicates;
}
```

**New dependency for fuzzy search:**
```bash
npm install fuse.js
```

**Estimated scope:** 4-5 files, ~600 lines

---

### 2.3 Notifications Feature

**Current state:** 65% complete
**Objective:** Production-ready email delivery with compliance

**Gaps to address:**

| Gap | Impact | Fix |
|-----|--------|-----|
| Plain text emails | Unprofessional | HTML templates with branding |
| No retry logic | Lost emails | Queue with exponential backoff |
| No unsubscribe | Legal risk | One-click unsubscribe links |
| No delivery tracking | No visibility | Webhook for delivery status |
| No audit trail | No debugging | Log all send attempts |

**Files to modify:**

| File | Changes |
|------|---------|
| `supabase/functions/create-notification/index.ts` | Templating, retry, unsubscribe |
| `src/features/notifications/notification-service.ts` | Delivery status tracking |
| `src/features/notifications/components/NotificationPreferences.tsx` | Unsubscribe UI |

**New files:**

| File | Purpose |
|------|---------|
| `supabase/functions/create-notification/templates/base.html` | Shared email layout |
| `supabase/functions/create-notification/templates/*.html` | Per-event templates |
| `supabase/functions/email-webhook/index.ts` | Handle Resend webhooks |
| `supabase/migrations/012_notification_delivery_log.sql` | Track email sends |

**Email template structure:**
```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
    .header { background: #0D1421; color: #C9A227; padding: 20px; }
    .content { padding: 20px; background: #151D2E; color: #FFFFFF; }
    .footer { padding: 20px; font-size: 12px; color: #8B95A5; }
    .button { background: #C9A227; color: #0D1421; padding: 12px 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logoUrl}}" alt="AV Designer" height="32" />
    </div>
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      <p>You're receiving this because you're a member of {{organizationName}}.</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> from these notifications.</p>
    </div>
  </div>
</body>
</html>
```

**Delivery log migration:**
```sql
-- 012_notification_delivery_log.sql
CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'push')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  external_id TEXT, -- Resend message ID
  error_message TEXT,
  attempts INTEGER DEFAULT 1,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status);
```

**Retry logic in edge function:**
```typescript
// In create-notification/index.ts
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

async function sendEmailWithRetry(
  to: string,
  subject: string,
  html: string,
  notificationId: string
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await resend.emails.send({
        from: 'AV Designer <notifications@avdesigner.app>',
        to,
        subject,
        html,
      });

      await logDelivery(notificationId, to, 'sent', result.id);
      return;
    } catch (error) {
      lastError = error as Error;
      await logDelivery(notificationId, to, 'failed', null, error.message, attempt + 1);

      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
      }
    }
  }

  throw lastError;
}
```

**Estimated scope:** 5-8 files, ~1000 lines

---

### Priority 2 Summary

| Feature | Files | Lines | Complexity |
|---------|-------|-------|------------|
| Templates | 4-6 | ~400 | Medium |
| Equipment Import | 4-5 | ~600 | Medium |
| Notifications | 5-8 | ~1000 | High |
| **Total** | **13-19** | **~2000** | |

---

## Priority 3: Bug Fixes

### 3.1 Type Safety Issues

**Objective:** Remove unsafe `as unknown as` casts with proper type definitions

**Affected files:**
- `src/features/settings/settings-service.ts`
- `src/features/drawings/drawing-service.ts`
- `src/features/room-builder/room-service.ts`
- `src/features/auth/auth-service.ts`
- `src/features/templates/template-service.ts`
- `src/features/projects/activity-service.ts`

**Solution:**

1. **Regenerate database types:**
```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

2. **Create JSON type definitions:**
```typescript
// src/types/database-json.ts
import { MountType, LayerType, ElementType } from './index';

export interface PlacedEquipmentJson {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  rotation: number;
  mountType: MountType;
  label?: string;
  notes?: string;
}

export interface DrawingLayerJson {
  id: string;
  name: string;
  type: LayerType;
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElementJson[];
}

export interface DrawingElementJson {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}

export interface TemplateContentJson {
  roomType?: string;
  width?: number;
  length?: number;
  equipment?: PlacedEquipmentJson[];
  connections?: ConnectionJson[];
}
```

3. **Create type-safe mappers:**
```typescript
// src/lib/database-mappers.ts
import { Json } from './database.types';
import { PlacedEquipment, DrawingLayer } from '../types';
import { PlacedEquipmentJson, DrawingLayerJson } from '../types/database-json';

export function mapJsonToPlacedEquipment(json: Json): PlacedEquipment[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as PlacedEquipmentJson[]).map(item => ({
    id: item.id,
    equipmentId: item.equipmentId,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  }));
}

export function mapPlacedEquipmentToJson(equipment: PlacedEquipment[]): Json {
  return equipment.map(item => ({
    id: item.id,
    equipmentId: item.equipmentId,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  })) as unknown as Json;
}

export function mapJsonToDrawingLayers(json: Json): DrawingLayer[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as DrawingLayerJson[]).map(layer => ({
    id: layer.id,
    name: layer.name,
    type: layer.type,
    isLocked: layer.isLocked,
    isVisible: layer.isVisible,
    elements: layer.elements.map(el => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      rotation: el.rotation,
      properties: el.properties,
    })),
  }));
}
```

4. **Update services to use mappers:**
```typescript
// In room-service.ts
import { mapJsonToPlacedEquipment, mapPlacedEquipmentToJson } from '../../lib/database-mappers';

// Before
placedEquipment: row.placed_equipment as unknown as PlacedEquipment[]

// After
placedEquipment: mapJsonToPlacedEquipment(row.placed_equipment)
```

**Estimated scope:** 2 new files, 6 service updates, ~200 lines

---

### 3.2 Logging Utility

**Objective:** Replace console.* calls with proper logging

**New file:** `src/lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDev = import.meta.env.DEV;

function formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data ?? '');
    }
  },

  info(message: string, data?: unknown): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  },

  warn(message: string, data?: unknown): void {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
    // Could send to monitoring service in production
  },

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error ?? '');
    // Could send to error tracking service (Sentry, etc.)
  },
};
```

**Files to update:**
- `src/features/auth/auth-store.ts` - Replace console.warn/error calls
- `src/features/auth/use-auth.ts` - Replace any console calls
- `src/lib/supabase.ts` - Use logger for config warnings

**Estimated scope:** 1 new file, 3-4 updates, ~80 lines

---

### 3.3 ESLint Rule Fix

**File:** `src/features/auth/use-auth.ts`

**Current:**
```typescript
useEffect(() => {
  authStore.initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Fixed:**
```typescript
const hasInitialized = useRef(false);

useEffect(() => {
  if (!hasInitialized.current) {
    hasInitialized.current = true;
    authStore.initialize();
  }
}, []);
```

**Estimated scope:** 1 file, ~10 lines

---

### 3.4 Error Boundaries

**Objective:** Graceful error handling for unhandled exceptions

**New file:** `src/components/ErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in React tree', { error, errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: FallbackProps) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>We're sorry, but something unexpected happened.</p>
      {import.meta.env.DEV && error && (
        <pre className="error-details">{error.message}</pre>
      )}
      <button onClick={onRetry} className="btn btn-primary">
        Try Again
      </button>
      <button onClick={() => window.location.reload()} className="btn btn-secondary">
        Reload Page
      </button>
    </div>
  );
}
```

**New file:** `src/components/FeatureErrorBoundary.tsx`

```typescript
import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface Props {
  feature: string;
  children: ReactNode;
}

export function FeatureErrorBoundary({ feature, children }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="feature-error">
          <h3>Unable to load {feature}</h3>
          <p>Please try refreshing the page.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Update App.tsx:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
```

**Estimated scope:** 2 new files, 1 update, ~100 lines

---

### Priority 3 Summary

| Fix | Files | Lines | Complexity |
|-----|-------|-------|------------|
| Type Safety | 8 | ~200 | Medium |
| Logging Utility | 4 | ~80 | Low |
| ESLint Rule | 1 | ~10 | Low |
| Error Boundaries | 3 | ~100 | Low |
| **Total** | **16** | **~390** | |

---

## Implementation Order

### Phase 1: Infrastructure (Week 1)
1. Supabase project setup and credentials
2. Environment validation fix
3. Push database migrations
4. Deploy edge functions
5. Create seed data script

### Phase 2: Authentication (Week 1-2)
1. OAuth integration (Google + Microsoft)
2. Auth callback page
3. Logging utility
4. Error boundaries

### Phase 3: Bug Fixes (Week 2)
1. Type safety - JSON mappers
2. ESLint rule fix
3. Update services to use mappers

### Phase 4: Templates (Week 2-3)
1. Fix mount type in apply
2. Add connection restoration
3. Content preview modal
4. Thumbnail generation

### Phase 5: Equipment Import (Week 3)
1. Add Excel parsing (xlsx)
2. Fuzzy deduplication
3. Enhanced error display
4. Partial import recovery

### Phase 6: Notifications (Week 3-4)
1. Email templates
2. Delivery log migration
3. Retry logic
4. Unsubscribe mechanism
5. Webhook handler

---

## Success Criteria

### Phase 1 Complete When:
- [ ] App connects to Supabase successfully
- [ ] Database has seed data
- [ ] User can sign up with email/password
- [ ] All pages load without errors

### Phase 2 Complete When:
- [ ] User can sign in with Google
- [ ] User can sign in with Microsoft
- [ ] OAuth callback works correctly
- [ ] Error boundary catches and displays errors

### Phase 3 Complete When:
- [ ] No `as unknown as` casts in services
- [ ] TypeScript compiles without type errors
- [ ] ESLint passes without disabled rules

### Phase 4 Complete When:
- [ ] Templates apply with correct mount types
- [ ] Equipment connections restored on apply
- [ ] User can preview template contents
- [ ] Templates have auto-generated thumbnails

### Phase 5 Complete When:
- [ ] User can import .xlsx files
- [ ] Duplicate equipment detected with fuzzy matching
- [ ] Failed rows show detailed errors
- [ ] Partial imports can be committed

### Phase 6 Complete When:
- [ ] Emails send with HTML templates
- [ ] Failed emails retry automatically
- [ ] Emails include unsubscribe link
- [ ] All email sends logged in database

---

## Dependencies

### External Services Required:
- Supabase project (free tier works for dev)
- Google Cloud Console (OAuth credentials)
- Microsoft Azure AD (OAuth credentials)
- Resend account (email delivery)

### NPM Packages to Add:
```json
{
  "xlsx": "^0.18.5",
  "fuse.js": "^7.0.0"
}
```

### Environment Variables Required:
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173

# Supabase Edge Function Secrets
RESEND_API_KEY=re_xxxxx
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OAuth provider approval delays | Medium | High | Start OAuth app registration early |
| Email deliverability issues | Low | Medium | Use Resend's verified sending domain |
| Type regeneration breaks code | Medium | Medium | Run type generation in CI, review changes |
| Seed data doesn't match schema | Low | Low | Validate seed SQL against migrations |

---

## Appendix: File Changes Summary

### New Files (12)
- `supabase/seed.sql`
- `src/features/auth/components/OAuthButtons.tsx`
- `src/pages/AuthCallbackPage.tsx`
- `src/types/database-json.ts`
- `src/lib/database-mappers.ts`
- `src/lib/logger.ts`
- `src/components/ErrorBoundary.tsx`
- `src/components/FeatureErrorBoundary.tsx`
- `supabase/functions/create-notification/templates/base.html`
- `supabase/functions/create-notification/templates/*.html` (multiple)
- `supabase/functions/email-webhook/index.ts`
- `supabase/migrations/012_notification_delivery_log.sql`

### Modified Files (~33)
- `src/lib/supabase.ts`
- `src/features/auth/auth-service.ts`
- `src/features/auth/auth-store.ts`
- `src/features/auth/use-auth.ts`
- `src/features/auth/components/LoginPage.tsx`
- `src/features/auth/components/SignupPage.tsx`
- `src/features/templates/template-apply.ts`
- `src/features/templates/template-service.ts`
- `src/features/templates/components/ApplyTemplateModal.tsx`
- `src/features/templates/components/TemplateEditor.tsx`
- `src/features/equipment/import-service.ts`
- `src/features/equipment/components/import/ImportWizard.tsx`
- `src/features/equipment/components/import/ImportPreview.tsx`
- `src/features/equipment/components/import/RowEditor.tsx`
- `src/features/notifications/notification-service.ts`
- `src/features/notifications/components/NotificationPreferences.tsx`
- `src/features/settings/settings-service.ts`
- `src/features/drawings/drawing-service.ts`
- `src/features/room-builder/room-service.ts`
- `src/features/projects/activity-service.ts`
- `src/components/layout/BackendGate.tsx`
- `src/App.tsx`
- `src/router.tsx`
- `supabase/functions/create-notification/index.ts`
- `supabase/config.toml`
- `package.json`

**Total: ~45 files, ~2900 lines**
