-- Update form responses table structure
ALTER TABLE public.form_responses 
ADD COLUMN IF NOT EXISTS form_type TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS form_title TEXT NOT NULL DEFAULT 'Untitled Form';

-- Update existing records if any
UPDATE public.form_responses 
SET form_type = 'general', form_title = 'General Form' 
WHERE form_type IS NULL OR form_title IS NULL;

-- Add policies for form responses
DROP POLICY IF EXISTS "Admins can view all form responses" ON public.form_responses;
CREATE POLICY "Admins can view all form responses" ON public.form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_patient_id ON public.form_responses(client_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_type ON public.form_responses(form_type);
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON public.form_responses(status);
