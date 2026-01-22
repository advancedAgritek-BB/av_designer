-- 003_projects_clients_extended.sql
-- Migration to extend Projects & Clients with full feature set
-- Created: 2026-01-19

SET search_path = public, extensions;

-- =============================================================================
-- EXTEND CLIENTS TABLE
-- =============================================================================

-- Add hierarchy and extended fields to existing clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS billing_terms TEXT DEFAULT 'Net 30',
  ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tax_exempt_id TEXT,
  ADD COLUMN IF NOT EXISTS template_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learned_patterns JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- Convert existing address column to JSONB if it's TEXT
-- (Existing schema has address as TEXT, we need JSONB)
ALTER TABLE public.clients
  ALTER COLUMN address TYPE JSONB USING COALESCE(
    CASE
      WHEN address IS NULL OR address = '' THEN '{}'::jsonb
      ELSE jsonb_build_object('street', address)
    END,
    '{}'::jsonb
  );

ALTER TABLE public.clients
  ALTER COLUMN address SET DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_clients_parent ON public.clients(parent_id);

-- =============================================================================
-- CLIENT CONTACTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_contacts_client ON public.client_contacts(client_id);

-- =============================================================================
-- CLIENT PRICE BOOK TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.client_price_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  override_price_cents INTEGER,
  discount_percent NUMERIC(5,2),
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, equipment_id, effective_date)
);

CREATE INDEX idx_price_book_client ON public.client_price_book(client_id);
CREATE INDEX idx_price_book_equipment ON public.client_price_book(equipment_id);

-- =============================================================================
-- EXTEND PROJECTS TABLE
-- =============================================================================

-- Add extended fields to existing projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS access_instructions TEXT,
  ADD COLUMN IF NOT EXISTS contract_value_cents INTEGER,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'client_team', 'organization')),
  ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'lead' CHECK (pipeline_status IN ('lead', 'proposal', 'won', 'lost', 'design', 'installation', 'complete', 'warranty')),
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Copy user_id to owner_id if owner_id is null
UPDATE public.projects SET owner_id = user_id WHERE owner_id IS NULL;

-- Make owner_id not null after backfill
-- ALTER TABLE public.projects ALTER COLUMN owner_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_pipeline ON public.projects(pipeline_status);

-- =============================================================================
-- PROJECT CONTACTS (assigned from client contacts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.client_contacts(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

CREATE INDEX idx_project_contacts_project ON public.project_contacts(project_id);

-- =============================================================================
-- PROJECT LOCATIONS TABLE (flexible hierarchy)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.project_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_type TEXT,
  description TEXT,
  address JSONB,
  access_instructions TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_location_hierarchy CHECK (id != parent_id)
);

CREATE INDEX idx_locations_project ON public.project_locations(project_id);
CREATE INDEX idx_locations_parent ON public.project_locations(parent_id);

-- Add location reference to rooms table
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.project_locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rooms_location ON public.rooms(location_id);

-- =============================================================================
-- WORKSTREAMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.workstreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('design', 'procurement', 'installation', 'custom')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workstreams_project ON public.workstreams(project_id);

-- =============================================================================
-- TASKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workstream_id UUID NOT NULL REFERENCES public.workstreams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'blocked', 'complete')),
  blocked_reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

CREATE INDEX idx_tasks_workstream ON public.tasks(workstream_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- =============================================================================
-- TASK DEPENDENCIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_deps_task ON public.task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON public.task_dependencies(depends_on_task_id);

-- =============================================================================
-- ACTIVITY EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  summary TEXT NOT NULL,
  details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON public.activity_events(project_id);
CREATE INDEX idx_activity_created ON public.activity_events(created_at DESC);
CREATE INDEX idx_activity_user ON public.activity_events(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_price_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Client contacts: Authenticated users can view/manage
CREATE POLICY "Authenticated users can view client contacts"
  ON public.client_contacts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage client contacts"
  ON public.client_contacts FOR ALL
  TO authenticated USING (true);

-- Client price book: Authenticated users can view/manage
CREATE POLICY "Authenticated users can view price book"
  ON public.client_price_book FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage price book"
  ON public.client_price_book FOR ALL
  TO authenticated USING (true);

-- Project contacts: Access through project ownership
CREATE POLICY "Users can view project contacts for their projects"
  ON public.project_contacts FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage project contacts for their projects"
  ON public.project_contacts FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Project locations: Access through project ownership
CREATE POLICY "Users can view locations for their projects"
  ON public.project_locations FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage locations for their projects"
  ON public.project_locations FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Workstreams: Access through project ownership
CREATE POLICY "Users can view workstreams for their projects"
  ON public.workstreams FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workstreams for their projects"
  ON public.workstreams FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Tasks: Access through workstream -> project ownership
CREATE POLICY "Users can view tasks for their projects"
  ON public.tasks FOR SELECT
  USING (
    workstream_id IN (
      SELECT w.id FROM public.workstreams w
      JOIN public.projects p ON p.id = w.project_id
      WHERE p.user_id = auth.uid() OR p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks for their projects"
  ON public.tasks FOR ALL
  USING (
    workstream_id IN (
      SELECT w.id FROM public.workstreams w
      JOIN public.projects p ON p.id = w.project_id
      WHERE p.user_id = auth.uid() OR p.owner_id = auth.uid()
    )
  );

-- Task dependencies: Access through task -> workstream -> project
CREATE POLICY "Users can view task dependencies for their projects"
  ON public.task_dependencies FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.workstreams w ON w.id = t.workstream_id
      JOIN public.projects p ON p.id = w.project_id
      WHERE p.user_id = auth.uid() OR p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage task dependencies for their projects"
  ON public.task_dependencies FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.workstreams w ON w.id = t.workstream_id
      JOIN public.projects p ON p.id = w.project_id
      WHERE p.user_id = auth.uid() OR p.owner_id = auth.uid()
    )
  );

-- Activity events: Access through project ownership
CREATE POLICY "Users can view activity for their projects"
  ON public.activity_events FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity for their projects"
  ON public.activity_events FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_client_contacts_updated_at
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_price_book_updated_at
  BEFORE UPDATE ON public.client_price_book
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_locations_updated_at
  BEFORE UPDATE ON public.project_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workstreams_updated_at
  BEFORE UPDATE ON public.workstreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to auto-create default workstreams when a project is created
CREATE OR REPLACE FUNCTION create_default_workstreams()
RETURNS TRIGGER AS $$
BEGIN
  -- Design workstream
  INSERT INTO public.workstreams (project_id, name, type, sort_order)
  VALUES (NEW.id, 'Design', 'design', 1);

  -- Procurement workstream
  INSERT INTO public.workstreams (project_id, name, type, sort_order)
  VALUES (NEW.id, 'Procurement', 'procurement', 2);

  -- Installation workstream
  INSERT INTO public.workstreams (project_id, name, type, sort_order)
  VALUES (NEW.id, 'Installation', 'installation', 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created_add_workstreams
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION create_default_workstreams();

-- Function to generate project number
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  IF NEW.project_number IS NULL THEN
    year_part := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
      CAST(SUBSTRING(project_number FROM 'PRJ-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM public.projects
    WHERE project_number LIKE 'PRJ-' || year_part || '-%';

    NEW.project_number := 'PRJ-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_insert_generate_number
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION generate_project_number();
