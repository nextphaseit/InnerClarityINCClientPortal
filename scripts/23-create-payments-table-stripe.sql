-- Create Stripe-integrated payments table for Inner Clarity Portal
-- This table stores payment records from Stripe webhooks

-- Drop existing payments table if it exists (to ensure clean setup)
DROP TABLE IF EXISTS payments CASCADE;

-- Create the payments table with Stripe integration
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents (Stripe format)
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'canceled', 'refunded')),
    stripe_payment_intent TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    stripe_session_id TEXT,
    description TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores patient payment records from Stripe';
COMMENT ON COLUMN payments.id IS 'UUID primary key for internal reference';
COMMENT ON COLUMN payments.patient_id IS 'References auth.users(id) - the patient who made the payment';
COMMENT ON COLUMN payments.email IS 'Customer email from Stripe checkout session';
COMMENT ON COLUMN payments.amount IS 'Payment amount in cents (Stripe format)';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, paid, failed, canceled, refunded';
COMMENT ON COLUMN payments.stripe_payment_intent IS 'Stripe payment intent ID (unique identifier)';
COMMENT ON COLUMN payments.stripe_customer_id IS 'Stripe customer ID for recurring payments';
COMMENT ON COLUMN payments.stripe_session_id IS 'Stripe checkout session ID';

-- Create indexes for optimal performance
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent);
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- 1. Patients can only SELECT their own payment records
CREATE POLICY "Patients can view own payments" ON payments
    FOR SELECT 
    USING (auth.uid() = patient_id);

-- 2. Only service role can INSERT (for Stripe webhooks)
CREATE POLICY "Service role can insert payments" ON payments
    FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

-- 3. Only service role can UPDATE (for payment status changes)
CREATE POLICY "Service role can update payments" ON payments
    FOR UPDATE 
    USING (auth.role() = 'service_role');

-- 4. Block DELETE operations (payments should be immutable for audit purposes)
CREATE POLICY "No deletes allowed" ON payments
    FOR DELETE 
    USING (false);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Create a view for payment summaries (useful for admin dashboard)
CREATE OR REPLACE VIEW payment_summaries AS
SELECT 
    p.patient_id,
    u.email as patient_email,
    COUNT(*) as total_payments,
    SUM(p.amount) as total_amount_cents,
    SUM(p.amount) / 100.0 as total_amount_dollars,
    MAX(p.created_at) as last_payment_date,
    COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_payments
FROM payments p
LEFT JOIN auth.users u ON p.patient_id = u.id
GROUP BY p.patient_id, u.email;

-- Grant access to the view for service role
GRANT SELECT ON payment_summaries TO service_role;

-- Create RLS policy for the view
ALTER VIEW payment_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can view payment summaries" ON payment_summaries
    FOR SELECT 
    USING (auth.role() = 'service_role');

-- Insert some sample payment data for testing (optional)
INSERT INTO payments (
    patient_id, 
    email, 
    amount, 
    status, 
    stripe_payment_intent,
    stripe_customer_id,
    description
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'demo@example.com',
    15000, -- $150.00 in cents
    'paid',
    'pi_test_1234567890',
    'cus_test_customer',
    'Individual Therapy Session Payment'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'demo@example.com',
    7500, -- $75.00 in cents
    'paid',
    'pi_test_0987654321',
    'cus_test_customer',
    'Group Therapy Session Payment'
)
ON CONFLICT (stripe_payment_intent) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Payments table created successfully!';
    RAISE NOTICE '🔐 Row Level Security policies configured';
    RAISE NOTICE '📊 Indexes created for optimal performance';
    RAISE NOTICE '🎯 Ready for Stripe webhook integration';
END $$;
