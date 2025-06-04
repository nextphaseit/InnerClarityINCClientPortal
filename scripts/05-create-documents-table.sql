-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('insurance', 'id', 'intake', 'consent', 'other')) DEFAULT 'other',
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    status TEXT CHECK (status IN ('uploaded', 'approved', 'rejected', 'pending')) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can upload documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = client_id);
