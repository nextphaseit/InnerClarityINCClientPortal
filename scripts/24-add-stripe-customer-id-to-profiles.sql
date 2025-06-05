-- Add stripe_customer_id to profiles table for customer portal integration

-- Add stripe_customer_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
        
        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
        ON profiles(stripe_customer_id);
        
        RAISE NOTICE 'Added stripe_customer_id column to profiles table';
    ELSE
        RAISE NOTICE 'stripe_customer_id column already exists in profiles table';
    END IF;
END $$;

-- Update RLS policies to allow service role to update stripe_customer_id
DROP POLICY IF EXISTS "Service role can update stripe customer ID" ON profiles;

CREATE POLICY "Service role can update stripe customer ID" ON profiles
FOR UPDATE USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing portal access';
