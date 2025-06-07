-- Production Database Cleanup
-- Run this to remove all demo/test data before going live

-- Clear demo users
DELETE FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%';

-- Clear demo appointments  
DELETE FROM appointments WHERE patient LIKE '%Demo%' OR patient LIKE '%Test%';

-- Clear demo messages
DELETE FROM messages WHERE subject LIKE '%Demo%' OR subject LIKE '%Test%';

-- Clear demo audit logs
DELETE FROM audit_logs WHERE details::text LIKE '%demo%';

-- Clear demo invoices
DELETE FROM invoices WHERE patient_email LIKE '%demo%' OR patient_email LIKE '%test%';

-- Clear demo payments
DELETE FROM payments WHERE customer_email LIKE '%demo%' OR customer_email LIKE '%test%';

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY; 
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for production
-- (Policies should already be in place from previous scripts)

COMMIT;
