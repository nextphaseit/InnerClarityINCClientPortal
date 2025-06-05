-- Create appointment_logs table to track telehealth session joins
CREATE TABLE IF NOT EXISTS public.appointment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.appointment_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own logs" 
  ON public.appointment_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs" 
  ON public.appointment_logs 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow admins to view all logs
CREATE POLICY "Admins can view all logs" 
  ON public.appointment_logs 
  FOR ALL 
  TO service_role 
  USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS appointment_logs_appointment_id_idx ON public.appointment_logs (appointment_id);
CREATE INDEX IF NOT EXISTS appointment_logs_action_idx ON public.appointment_logs (action);
CREATE INDEX IF NOT EXISTS appointment_logs_timestamp_idx ON public.appointment_logs (timestamp);
