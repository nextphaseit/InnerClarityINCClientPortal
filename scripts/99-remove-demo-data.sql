-- Remove all demo/test data from production tables

-- Clear demo profiles
DELETE FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%';

-- Clear demo appointments
DELETE FROM appointments WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo messages
DELETE FROM messages WHERE sender_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
) OR recipient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo payments
DELETE FROM payments WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo invoices
DELETE FROM invoices WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo documents
DELETE FROM documents WHERE client_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo form responses
DELETE FROM form_responses WHERE client_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo health logs
DELETE FROM health_logs WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo audit logs
DELETE FROM audit_logs WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo admin users
DELETE FROM admin_users WHERE email LIKE '%demo%' OR email LIKE '%test%';

-- Clear demo telehealth sessions
DELETE FROM telehealth_sessions WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo autopay settings
DELETE FROM autopay_settings WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

-- Clear demo appointment requests
DELETE FROM appointment_requests WHERE patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%'
);

COMMIT;
