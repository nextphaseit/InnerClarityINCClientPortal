-- Create form responses table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    form_type TEXT NOT NULL,
    form_title TEXT NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed')) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own form responses" ON public.form_responses
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can submit forms" ON public.form_responses
    FOR INSERT WITH CHECK (auth.uid() = client_id);
