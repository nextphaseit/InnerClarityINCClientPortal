-- Create autopay_settings table
CREATE TABLE IF NOT EXISTS public.autopay_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    billing_cycle TEXT CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    next_payment_date DATE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    payment_method_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id)
);

-- Enable Row Level Security
ALTER TABLE public.autopay_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own autopay settings" ON public.autopay_settings
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can update own autopay settings" ON public.autopay_settings
    FOR ALL USING (auth.uid() = patient_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_autopay_settings_patient_id ON public.autopay_settings(patient_id);
CREATE INDEX IF NOT EXISTS idx_autopay_settings_stripe_customer ON public.autopay_settings(stripe_customer_id);
