-- Create appointment requests table
CREATE TABLE IF NOT EXISTS public.appointment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    appointment_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment requests
CREATE POLICY "Patients can view own appointment requests" ON public.appointment_requests
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create appointment requests" ON public.appointment_requests
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins can view all appointment requests" ON public.appointment_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update appointment requests" ON public.appointment_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for better performance
CREATE INDEX idx_appointment_requests_patient_id ON public.appointment_requests(patient_id);
CREATE INDEX idx_appointment_requests_status ON public.appointment_requests(status);
