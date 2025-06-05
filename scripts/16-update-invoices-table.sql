-- Update invoices table to use consistent column naming
-- Add patient_id column if it doesn't exist, and update existing data

-- First, add the patient_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'patient_id') THEN
        ALTER TABLE public.invoices ADD COLUMN patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing records to use patient_id if client_id exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        UPDATE public.invoices SET patient_id = client_id WHERE patient_id IS NULL;
    END IF;
END $$;

-- Add missing columns for better invoice management
DO $$
BEGIN
    -- Add invoice_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
        ALTER TABLE public.invoices ADD COLUMN invoice_number TEXT UNIQUE;
    END IF;
    
    -- Add paid_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'paid_date') THEN
        ALTER TABLE public.invoices ADD COLUMN paid_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update status enum to include all needed statuses
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'invoices' AND constraint_name = 'invoices_status_check') THEN
        ALTER TABLE public.invoices DROP CONSTRAINT invoices_status_check;
    END IF;
    
    -- Add the updated constraint
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled'));
END $$;

-- Generate invoice numbers for existing records that don't have them
UPDATE public.invoices 
SET invoice_number = 'INV-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE invoice_number IS NULL;

-- Update RLS policies to use patient_id
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = client_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
