-- Seed Data for AV Designer
-- Run after migrations: supabase db reset (includes seed)

-- Note: Users are created through Supabase Auth, not directly in this seed
-- This seed assumes equipment can be organization-independent (global catalog)

-- Insert sample equipment (35+ items across categories)
INSERT INTO equipment (id, manufacturer, model, sku, category, subcategory, description, cost, msrp, dimensions, weight, organization_id)
VALUES
  -- Video Equipment
  (gen_random_uuid(), 'Poly', 'Studio X50', 'POLY-X50', 'video', 'video_bar', 'All-in-one video bar for small rooms', 250000, 349900, '{"width": 24, "height": 4, "depth": 5}', 8.5, NULL),
  (gen_random_uuid(), 'Poly', 'Studio X70', 'POLY-X70', 'video', 'video_bar', 'All-in-one video bar for medium rooms', 450000, 599900, '{"width": 48, "height": 4, "depth": 5}', 12.0, NULL),
  (gen_random_uuid(), 'Logitech', 'Rally Bar', 'LOGI-RALLY', 'video', 'video_bar', 'Premier all-in-one video bar', 350000, 499900, '{"width": 36, "height": 5, "depth": 4}', 10.5, NULL),
  (gen_random_uuid(), 'Logitech', 'Rally Bar Mini', 'LOGI-RALLY-MINI', 'video', 'video_bar', 'Compact video bar for huddle rooms', 220000, 299900, '{"width": 24, "height": 4, "depth": 4}', 6.5, NULL),
  (gen_random_uuid(), 'Cisco', 'Room Bar', 'CISCO-ROOMBAR', 'video', 'video_bar', 'Cisco collaboration video bar', 380000, 549900, '{"width": 32, "height": 5, "depth": 5}', 9.0, NULL),
  (gen_random_uuid(), 'Samsung', 'QB65R', 'SAM-QB65R', 'video', 'display', '65" 4K commercial display', 120000, 179900, '{"width": 57, "height": 33, "depth": 2}', 55.0, NULL),
  (gen_random_uuid(), 'Samsung', 'QB75R', 'SAM-QB75R', 'video', 'display', '75" 4K commercial display', 180000, 269900, '{"width": 66, "height": 38, "depth": 2}', 75.0, NULL),
  (gen_random_uuid(), 'LG', '65UL3J', 'LG-65UL3J', 'video', 'display', '65" 4K UHD signage display', 110000, 159900, '{"width": 57, "height": 33, "depth": 3}', 52.0, NULL),
  (gen_random_uuid(), 'Sony', 'FW-65BZ40H', 'SONY-65BZ40H', 'video', 'display', '65" BRAVIA professional display', 150000, 219900, '{"width": 57, "height": 33, "depth": 3}', 58.0, NULL),
  (gen_random_uuid(), 'PTZOptics', 'Move 4K', 'PTZ-MOVE4K', 'video', 'camera', '4K PTZ camera with NDI', 180000, 249900, '{"width": 6, "height": 7, "depth": 6}', 2.5, NULL),

  -- Audio Equipment
  (gen_random_uuid(), 'Shure', 'MXA920', 'SHURE-MXA920', 'audio', 'microphone', 'Ceiling array microphone 24x24', 320000, 429900, '{"width": 24, "height": 2, "depth": 24}', 8.0, NULL),
  (gen_random_uuid(), 'Shure', 'MXA910', 'SHURE-MXA910', 'audio', 'microphone', 'Ceiling array microphone with IntelliMix', 280000, 379900, '{"width": 24, "height": 2, "depth": 24}', 7.5, NULL),
  (gen_random_uuid(), 'Sennheiser', 'TeamConnect Ceiling 2', 'SENN-TCC2', 'audio', 'microphone', 'Beamforming ceiling microphone', 350000, 479900, '{"width": 24, "height": 3, "depth": 24}', 9.0, NULL),
  (gen_random_uuid(), 'Biamp', 'Parle TCM-XA', 'BIAMP-TCM-XA', 'audio', 'microphone', 'Beamtracking ceiling microphone', 250000, 349900, '{"width": 24, "height": 2, "depth": 24}', 6.5, NULL),
  (gen_random_uuid(), 'QSC', 'AD-C6T', 'QSC-ADC6T', 'audio', 'speaker', '6.5" ceiling speaker', 18000, 24900, '{"width": 9, "height": 5, "depth": 9}', 4.0, NULL),
  (gen_random_uuid(), 'JBL', 'Control 26CT', 'JBL-C26CT', 'audio', 'speaker', '6.5" ceiling speaker', 15000, 19900, '{"width": 9, "height": 5, "depth": 9}', 3.5, NULL),
  (gen_random_uuid(), 'Biamp', 'TesiraFORTE AI', 'BIAMP-FORTE-AI', 'audio', 'dsp', 'Digital signal processor with AEC', 350000, 479900, '{"width": 17, "height": 2, "depth": 12}', 6.0, NULL),
  (gen_random_uuid(), 'QSC', 'Core 110f', 'QSC-CORE110F', 'audio', 'dsp', 'Q-SYS Core processor', 280000, 379900, '{"width": 17, "height": 2, "depth": 14}', 7.5, NULL),
  (gen_random_uuid(), 'Shure', 'IntelliMix P300', 'SHURE-P300', 'audio', 'dsp', 'Audio conferencing processor', 120000, 169900, '{"width": 8, "height": 2, "depth": 8}', 2.0, NULL),
  (gen_random_uuid(), 'Crown', 'DCi 4|300', 'CROWN-DCI4300', 'audio', 'amplifier', '4-channel 300W amplifier', 150000, 209900, '{"width": 17, "height": 4, "depth": 14}', 18.0, NULL),

  -- Control Equipment
  (gen_random_uuid(), 'Crestron', 'TSW-1070', 'CREST-TSW1070', 'control', 'touch_panel', '10" touch screen', 180000, 249900, '{"width": 10, "height": 7, "depth": 2}', 2.5, NULL),
  (gen_random_uuid(), 'Crestron', 'TSW-770', 'CREST-TSW770', 'control', 'touch_panel', '7" touch screen', 120000, 169900, '{"width": 7, "height": 5, "depth": 2}', 1.5, NULL),
  (gen_random_uuid(), 'Extron', 'TLP Pro 1025M', 'EXTRON-TLP1025', 'control', 'touch_panel', '10" tabletop touchpanel', 160000, 219900, '{"width": 10, "height": 7, "depth": 4}', 3.0, NULL),
  (gen_random_uuid(), 'Crestron', 'CP4-R', 'CREST-CP4R', 'control', 'processor', '4-Series control processor', 280000, 379900, '{"width": 8, "height": 2, "depth": 8}', 3.5, NULL),
  (gen_random_uuid(), 'Crestron', 'MC4-R', 'CREST-MC4R', 'control', 'processor', '4-Series media controller', 220000, 299900, '{"width": 8, "height": 2, "depth": 8}', 3.0, NULL),
  (gen_random_uuid(), 'Extron', 'IPCP Pro 550', 'EXTRON-IPCP550', 'control', 'processor', 'IP Link Pro control processor', 250000, 349900, '{"width": 8, "height": 2, "depth": 10}', 4.0, NULL),

  -- Infrastructure Equipment
  (gen_random_uuid(), 'Crestron', 'NVX-E30', 'CREST-NVXE30', 'infrastructure', 'encoder', '4K60 AV-over-IP encoder', 150000, 209900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Crestron', 'NVX-D30', 'CREST-NVXD30', 'infrastructure', 'decoder', '4K60 AV-over-IP decoder', 120000, 169900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Extron', 'DTP2 T 212', 'EXTRON-DTP2T212', 'infrastructure', 'transmitter', 'DTP2 4K transmitter', 80000, 109900, '{"width": 4, "height": 1, "depth": 4}', 0.5, NULL),
  (gen_random_uuid(), 'Extron', 'DTP2 R 212', 'EXTRON-DTP2R212', 'infrastructure', 'receiver', 'DTP2 4K receiver', 60000, 84900, '{"width": 4, "height": 1, "depth": 4}', 0.5, NULL),
  (gen_random_uuid(), 'Crestron', 'HD-DA4-4KZ-E', 'CREST-HDDA4', 'infrastructure', 'distribution', '1x4 HDMI distribution amp', 45000, 64900, '{"width": 8, "height": 1, "depth": 6}', 1.0, NULL),
  (gen_random_uuid(), 'Extron', 'SW4 HD 4K PLUS', 'EXTRON-SW4HD', 'infrastructure', 'switcher', '4x1 HDMI switcher', 55000, 79900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Crestron', 'HD-MD4X2-4KZ-E', 'CREST-HDMD4X2', 'infrastructure', 'matrix', '4x2 HDMI matrix switcher', 95000, 134900, '{"width": 8, "height": 2, "depth": 8}', 3.0, NULL),
  (gen_random_uuid(), 'Middle Atlantic', 'QUIK-IRS-6', 'MIDATL-IRS6', 'infrastructure', 'rack', '6U in-room rack', 35000, 49900, '{"width": 22, "height": 12, "depth": 24}', 45.0, NULL),
  (gen_random_uuid(), 'Middle Atlantic', 'BGR-19SA-32', 'MIDATL-BGR32', 'infrastructure', 'rack', '32U server rack', 85000, 119900, '{"width": 24, "height": 60, "depth": 32}', 180.0, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample standard nodes (folder structure)
INSERT INTO standard_nodes (id, name, parent_id, type, "order")
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Room Types', NULL, 'folder', 1),
  ('00000000-0000-0000-0000-000000000002', 'Platforms', NULL, 'folder', 2),
  ('00000000-0000-0000-0000-000000000003', 'Quality Tiers', NULL, 'folder', 3),
  ('00000000-0000-0000-0000-000000000011', 'Huddle Room', '00000000-0000-0000-0000-000000000001', 'standard', 1),
  ('00000000-0000-0000-0000-000000000012', 'Conference Room', '00000000-0000-0000-0000-000000000001', 'standard', 2),
  ('00000000-0000-0000-0000-000000000013', 'Boardroom', '00000000-0000-0000-0000-000000000001', 'standard', 3),
  ('00000000-0000-0000-0000-000000000014', 'Training Room', '00000000-0000-0000-0000-000000000001', 'standard', 4),
  ('00000000-0000-0000-0000-000000000021', 'Microsoft Teams', '00000000-0000-0000-0000-000000000002', 'standard', 1),
  ('00000000-0000-0000-0000-000000000022', 'Zoom', '00000000-0000-0000-0000-000000000002', 'standard', 2),
  ('00000000-0000-0000-0000-000000000023', 'Google Meet', '00000000-0000-0000-0000-000000000002', 'standard', 3),
  ('00000000-0000-0000-0000-000000000031', 'Standard', '00000000-0000-0000-0000-000000000003', 'standard', 1),
  ('00000000-0000-0000-0000-000000000032', 'Premium', '00000000-0000-0000-0000-000000000003', 'standard', 2),
  ('00000000-0000-0000-0000-000000000033', 'Enterprise', '00000000-0000-0000-0000-000000000003', 'standard', 3)
ON CONFLICT DO NOTHING;

-- Insert sample rules
INSERT INTO rules (id, name, description, aspect, expression_type, conditions, expression, priority, is_active, standard_id)
VALUES
  -- Room Type Rules
  (gen_random_uuid(), 'Huddle Room Display Size', 'Display size requirements for huddle rooms', 'equipment_selection', 'constraint',
   '[{"field": "roomType", "operator": "equals", "value": "huddle"}]',
   'display.size >= 55 AND display.size <= 65', 1, true, '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Conference Room Display Size', 'Display size requirements for conference rooms', 'equipment_selection', 'constraint',
   '[{"field": "roomType", "operator": "equals", "value": "conference"}]',
   'display.size >= 65 AND display.size <= 85', 1, true, '00000000-0000-0000-0000-000000000012'),
  (gen_random_uuid(), 'Boardroom Dual Display', 'Boardrooms require dual displays', 'equipment_selection', 'constraint',
   '[{"field": "roomType", "operator": "equals", "value": "boardroom"}]',
   'display.count >= 2', 1, true, '00000000-0000-0000-0000-000000000013'),

  -- Platform Rules
  (gen_random_uuid(), 'Teams Certification Required', 'Equipment must be Teams certified', 'equipment_selection', 'constraint',
   '[{"field": "platform", "operator": "equals", "value": "teams"}]',
   'equipment.certifications CONTAINS "teams"', 2, true, '00000000-0000-0000-0000-000000000021'),
  (gen_random_uuid(), 'Zoom Certification Required', 'Equipment must be Zoom certified', 'equipment_selection', 'constraint',
   '[{"field": "platform", "operator": "equals", "value": "zoom"}]',
   'equipment.certifications CONTAINS "zoom"', 2, true, '00000000-0000-0000-0000-000000000022'),

  -- Coverage Rules
  (gen_random_uuid(), 'Microphone Coverage', 'One microphone per 100 sq ft', 'quantities', 'formula',
   '[]',
   'CEIL(room.area / 100)', 3, true, NULL),
  (gen_random_uuid(), 'Speaker Coverage', 'One speaker per 150 sq ft', 'quantities', 'formula',
   '[]',
   'CEIL(room.area / 150)', 3, true, NULL),

  -- Quality Tier Rules
  (gen_random_uuid(), 'Premium Audio Required', 'Premium tier requires ceiling mics', 'equipment_selection', 'constraint',
   '[{"field": "tier", "operator": "equals", "value": "premium"}]',
   'microphone.type == "ceiling_array"', 1, true, '00000000-0000-0000-0000-000000000032'),
  (gen_random_uuid(), 'Enterprise DSP Required', 'Enterprise tier requires DSP', 'equipment_selection', 'constraint',
   '[{"field": "tier", "operator": "equals", "value": "enterprise"}]',
   'dsp.count >= 1', 1, true, '00000000-0000-0000-0000-000000000033'),

  -- Placement Rules
  (gen_random_uuid(), 'Display Height Placement', 'Display center should be at 48-54 inches', 'placement', 'constraint',
   '[{"field": "equipment.category", "operator": "equals", "value": "video"}]',
   'equipment.mountHeight >= 48 AND equipment.mountHeight <= 54', 4, true, NULL),
  (gen_random_uuid(), 'Camera Height', 'Camera should be at eye level or above display', 'placement', 'constraint',
   '[{"field": "equipment.subcategory", "operator": "equals", "value": "camera"}]',
   'equipment.mountHeight >= 48 AND equipment.mountHeight <= 72', 4, true, NULL)
ON CONFLICT DO NOTHING;

-- Note: Projects, rooms, and quotes should be created through the application
-- after a user signs up and creates an organization
