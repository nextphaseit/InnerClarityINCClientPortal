-- Insert sample invoices for demo purposes
-- Note: Replace the patient_id with actual user IDs from your profiles table

INSERT INTO invoices (patient_id, invoice_number, amount, description, status, due_date, created_at) VALUES
  (
    (SELECT id FROM profiles LIMIT 1), -- Gets the first profile ID
    'INV-2024-001',
    150.00,
    'Individual Therapy Session - Dr. Sarah Johnson',
    'paid',
    '2024-02-15',
    '2024-01-15 10:00:00+00'
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'INV-2024-002',
    75.00,
    'Group Therapy Session - Anxiety Management',
    'pending',
    '2024-03-01',
    '2024-02-01 14:30:00+00'
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'INV-2024-003',
    300.00,
    'Psychological Assessment - Dr. Michael Chen',
    'overdue',
    '2024-02-20',
    '2024-01-20 09:15:00+00'
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'INV-2024-004',
    200.00,
    'Family Therapy Session - Dr. Emily Rodriguez',
    'pending',
    '2024-03-15',
    '2024-02-15 16:45:00+00'
  );

-- Insert sample payment record
INSERT INTO payments (patient_id, amount, status, description, created_at) VALUES
  (
    (SELECT id FROM profiles LIMIT 1),
    150.00,
    'succeeded',
    'Payment for INV-2024-001',
    '2024-01-20 11:30:00+00'
  );
