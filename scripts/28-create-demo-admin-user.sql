-- Create demo admin user for testing
INSERT INTO admin_users (
  id,
  auth0_user_id,
  email,
  full_name,
  role,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'demo-admin-001',
  'demo@admin.nextphaseit.org',
  'Demo Administrator',
  'super_admin',
  'active',
  'system',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Also insert into profiles table for consistency
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'demo@admin.nextphaseit.org',
  'Demo Administrator',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
