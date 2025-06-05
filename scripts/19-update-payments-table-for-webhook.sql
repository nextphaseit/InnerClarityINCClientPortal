-- Update payments table to support webhook data structure
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Update the status check constraint to include Stripe payment statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'processing', 'requires_action'));

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout_session_id ON payments(stripe_checkout_session_id);

-- Update RLS policies to allow webhook insertions
DROP POLICY IF EXISTS "Allow webhook insertions" ON payments;
CREATE POLICY "Allow webhook insertions" ON payments
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions for service role
GRANT INSERT ON payments TO service_role;
GRANT SELECT ON profiles TO service_role;
