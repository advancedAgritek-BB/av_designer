-- AV Designer MVP - Initial Database Schema
-- Migration: 001_initial_schema
-- Created: 2026-01-18

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TYPES / ENUMS
-- =============================================================================

-- Equipment categories
CREATE TYPE equipment_category AS ENUM (
  'video',
  'audio',
  'control',
  'infrastructure'
);

-- Project statuses
CREATE TYPE project_status AS ENUM (
  'draft',
  'quoting',
  'client_review',
  'ordered',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled'
);

-- Room types
CREATE TYPE room_type AS ENUM (
  'conference',
  'boardroom',
  'huddle',
  'training',
  'auditorium',
  'lobby',
  'custom'
);

-- Platform types (matches TypeScript PLATFORMS constant)
CREATE TYPE platform_type AS ENUM (
  'teams',
  'zoom',
  'webex',
  'meet',
  'multi',
  'none'
);

-- Drawing types (matches TypeScript DrawingType)
CREATE TYPE drawing_type AS ENUM (
  'electrical',
  'elevation',
  'rcp',
  'rack',
  'cable_schedule',
  'floor_plan'
);

-- Rule aspect (what the rule validates)
CREATE TYPE rule_aspect AS ENUM (
  'display_count',
  'microphone_coverage',
  'speaker_placement',
  'camera_angle',
  'cable_length',
  'rack_space',
  'power_requirements',
  'compatibility',
  'custom'
);

-- Rule expression type
CREATE TYPE rule_expression_type AS ENUM (
  'comparison',
  'range',
  'formula',
  'lookup',
  'custom'
);

-- Standard node type
CREATE TYPE standard_node_type AS ENUM (
  'category',
  'subcategory',
  'item'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table (integrated with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'designer' CHECK (role IN ('admin', 'designer', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL, -- Denormalized for quick access
  status project_status DEFAULT 'draft' NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category equipment_category NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,

  -- Pricing (stored in cents to avoid floating point issues)
  cost_cents INTEGER DEFAULT 0 NOT NULL,
  msrp_cents INTEGER DEFAULT 0 NOT NULL,

  -- Physical specifications
  dimensions JSONB DEFAULT '{"height": 0, "width": 0, "depth": 0}'::jsonb NOT NULL,
  weight_lbs NUMERIC(10, 2) DEFAULT 0,

  -- Electrical specifications
  electrical JSONB DEFAULT '{}'::jsonb,

  -- Platform certifications
  platform_certifications TEXT[] DEFAULT '{}',

  -- Additional data
  specifications JSONB DEFAULT '{}'::jsonb,
  compatibility JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  spec_sheet_url TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_dimensions CHECK (
    (dimensions->>'height')::numeric >= 0 AND
    (dimensions->>'width')::numeric >= 0 AND
    (dimensions->>'depth')::numeric >= 0
  )
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  room_type room_type DEFAULT 'conference' NOT NULL,

  -- Dimensions (in feet)
  width NUMERIC(10, 2) NOT NULL CHECK (width > 0),
  length NUMERIC(10, 2) NOT NULL CHECK (length > 0),
  ceiling_height NUMERIC(10, 2) DEFAULT 9.0 NOT NULL CHECK (ceiling_height > 0),

  -- AV Configuration (matches TypeScript types)
  platform platform_type DEFAULT 'teams',
  ecosystem TEXT DEFAULT 'poly' CHECK (ecosystem IN ('poly', 'logitech', 'cisco', 'crestron', 'biamp', 'qsc', 'mixed')),
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('budget', 'standard', 'premium', 'executive')),

  -- Placed equipment (JSON array of placement data)
  placed_equipment JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Room features/notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Room Equipment (junction table for equipment placement)
CREATE TABLE room_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,

  -- Placement data
  position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb NOT NULL,
  rotation NUMERIC(5, 2) DEFAULT 0 NOT NULL CHECK (rotation >= 0 AND rotation < 360),

  -- Connection data
  connections JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Additional info
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Standard Nodes (hierarchical structure for AV standards)
CREATE TABLE standard_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES standard_nodes(id) ON DELETE CASCADE,
  type standard_node_type DEFAULT 'category' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  description TEXT,

  CONSTRAINT valid_hierarchy CHECK (id != parent_id)
);

-- Standards (rules attached to standard nodes)
CREATE TABLE standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES standard_nodes(id) ON DELETE CASCADE NOT NULL,
  rules JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Rules table (standalone validation rules)
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  aspect rule_aspect NOT NULL,
  expression_type rule_expression_type NOT NULL,

  -- Rule configuration
  conditions JSONB DEFAULT '[]'::jsonb NOT NULL,
  expression TEXT NOT NULL,

  -- Execution settings
  priority INTEGER DEFAULT 100 NOT NULL CHECK (priority >= 0 AND priority <= 1000),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,

  -- Quote items (equipment with quantities and pricing)
  items JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Totals (stored in cents)
  subtotal_cents INTEGER DEFAULT 0 NOT NULL,
  tax_cents INTEGER DEFAULT 0 NOT NULL,
  total_cents INTEGER DEFAULT 0 NOT NULL,

  -- Quote metadata
  currency TEXT DEFAULT 'USD' NOT NULL,
  tax_rate NUMERIC(5, 4) DEFAULT 0.0 NOT NULL,
  valid_until DATE,
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Drawings table
CREATE TABLE drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  type drawing_type NOT NULL,

  -- Drawing data
  layers JSONB DEFAULT '[]'::jsonb NOT NULL,
  overrides JSONB DEFAULT '{}'::jsonb NOT NULL,

  -- Export settings
  scale TEXT DEFAULT '1/4" = 1\'-0"',
  paper_size TEXT DEFAULT 'ARCH D',

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);

-- Clients
CREATE INDEX idx_clients_name ON clients(name);

-- Projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Equipment
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_subcategory ON equipment(subcategory);
CREATE INDEX idx_equipment_manufacturer ON equipment(manufacturer);
CREATE INDEX idx_equipment_sku ON equipment(sku);
CREATE INDEX idx_equipment_search ON equipment USING GIN (to_tsvector('english', manufacturer || ' ' || model || ' ' || description));

-- Rooms
CREATE INDEX idx_rooms_project_id ON rooms(project_id);
CREATE INDEX idx_rooms_room_type ON rooms(room_type);

-- Room Equipment
CREATE INDEX idx_room_equipment_room_id ON room_equipment(room_id);
CREATE INDEX idx_room_equipment_equipment_id ON room_equipment(equipment_id);

-- Standard Nodes
CREATE INDEX idx_standard_nodes_parent_id ON standard_nodes(parent_id);
CREATE INDEX idx_standard_nodes_type ON standard_nodes(type);

-- Standards
CREATE INDEX idx_standards_node_id ON standards(node_id);

-- Rules
CREATE INDEX idx_rules_aspect ON rules(aspect);
CREATE INDEX idx_rules_is_active ON rules(is_active);
CREATE INDEX idx_rules_priority ON rules(priority);

-- Quotes
CREATE INDEX idx_quotes_project_id ON quotes(project_id);
CREATE INDEX idx_quotes_room_id ON quotes(room_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- Drawings
CREATE INDEX idx_drawings_room_id ON drawings(room_id);
CREATE INDEX idx_drawings_type ON drawings(type);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Clients policies (all authenticated users can view, owners can modify)
CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clients" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON clients
  FOR UPDATE TO authenticated USING (true);

-- Projects policies (users can only access their own projects)
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Equipment policies (all authenticated users can view, admins can modify)
CREATE POLICY "Authenticated users can view equipment" ON equipment
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert equipment" ON equipment
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update equipment" ON equipment
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Rooms policies (access through project ownership)
CREATE POLICY "Users can view rooms in their projects" ON rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert rooms in their projects" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can update rooms in their projects" ON rooms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete rooms in their projects" ON rooms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid())
  );

-- Room Equipment policies (access through room → project ownership)
CREATE POLICY "Users can view room equipment in their projects" ON room_equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_equipment.room_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage room equipment in their projects" ON room_equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_equipment.room_id AND projects.user_id = auth.uid()
    )
  );

-- Standard Nodes policies (viewable by all, modifiable by admins)
CREATE POLICY "Authenticated users can view standard nodes" ON standard_nodes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage standard nodes" ON standard_nodes
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Standards policies
CREATE POLICY "Authenticated users can view standards" ON standards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage standards" ON standards
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Rules policies
CREATE POLICY "Authenticated users can view rules" ON rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage rules" ON rules
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Quotes policies (access through project ownership)
CREATE POLICY "Users can view quotes for their projects" ON quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = quotes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can manage quotes for their projects" ON quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = quotes.project_id AND projects.user_id = auth.uid())
  );

-- Drawings policies (access through room → project ownership)
CREATE POLICY "Users can view drawings for their projects" ON drawings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id = drawings.room_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage drawings for their projects" ON drawings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id = drawings.room_id AND projects.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_equipment_updated_at
  BEFORE UPDATE ON room_equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standards_updated_at
  BEFORE UPDATE ON standards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drawings_updated_at
  BEFORE UPDATE ON drawings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate quote totals
CREATE OR REPLACE FUNCTION calculate_quote_totals(quote_id UUID)
RETURNS void AS $$
DECLARE
  subtotal INTEGER;
  tax_amount INTEGER;
  quote_tax_rate NUMERIC(5, 4);
BEGIN
  -- Get tax rate for the quote
  SELECT tax_rate INTO quote_tax_rate FROM quotes WHERE id = quote_id;

  -- Calculate subtotal from items
  SELECT COALESCE(SUM((item->>'unit_price_cents')::integer * (item->>'quantity')::integer), 0)
  INTO subtotal
  FROM quotes, jsonb_array_elements(items) AS item
  WHERE quotes.id = quote_id;

  -- Calculate tax
  tax_amount := ROUND(subtotal * quote_tax_rate);

  -- Update quote totals
  UPDATE quotes
  SET
    subtotal_cents = subtotal,
    tax_cents = tax_amount,
    total_cents = subtotal + tax_amount
  WHERE id = quote_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED DATA (for development)
-- =============================================================================

-- Insert sample standard nodes for AV standards hierarchy
INSERT INTO standard_nodes (id, name, type, sort_order, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Video Systems', 'category', 1, 'Standards for video displays, cameras, and codecs'),
  ('00000000-0000-0000-0000-000000000002', 'Audio Systems', 'category', 2, 'Standards for microphones, speakers, and DSP'),
  ('00000000-0000-0000-0000-000000000003', 'Control Systems', 'category', 3, 'Standards for control processors and interfaces'),
  ('00000000-0000-0000-0000-000000000004', 'Infrastructure', 'category', 4, 'Standards for racks, cabling, and power');

INSERT INTO standard_nodes (id, name, parent_id, type, sort_order, description) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Display Sizing', '00000000-0000-0000-0000-000000000001', 'subcategory', 1, 'Guidelines for display size selection'),
  ('00000000-0000-0000-0000-000000000012', 'Camera Placement', '00000000-0000-0000-0000-000000000001', 'subcategory', 2, 'Guidelines for camera positioning'),
  ('00000000-0000-0000-0000-000000000021', 'Microphone Coverage', '00000000-0000-0000-0000-000000000002', 'subcategory', 1, 'Guidelines for microphone placement'),
  ('00000000-0000-0000-0000-000000000022', 'Speaker Layout', '00000000-0000-0000-0000-000000000002', 'subcategory', 2, 'Guidelines for speaker placement');

-- Insert sample validation rules
INSERT INTO rules (name, description, aspect, expression_type, conditions, expression, priority, is_active) VALUES
  ('Display Count Rule', 'Ensure appropriate number of displays for room size', 'display_count', 'formula', '[]', 'CEILING(room_width * room_length / 400)', 100, true),
  ('Mic Coverage Rule', 'Ensure microphone coverage for room capacity', 'microphone_coverage', 'formula', '[]', 'CEILING(room_capacity / 6)', 100, true),
  ('Camera Angle Rule', 'Ensure camera viewing angle covers seating area', 'camera_angle', 'range', '[{"field": "viewing_angle", "min": 90, "max": 120}]', 'viewing_angle BETWEEN 90 AND 120', 100, true);
