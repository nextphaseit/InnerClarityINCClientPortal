-- Create telehealth sessions table to track when patients join video sessions
CREATE TABLE IF NOT EXISTS telehealth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'joined',
  device_info JSONB,
  network_quality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add this constraint if you have an appointments table with an id column
  -- FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Add RLS policies
ALTER TABLE telehealth_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for inserting records - patients can only insert their own records
CREATE POLICY telehealth_insert_policy ON telehealth_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Policy for viewing records - patients can only view their own records, admins can view all
CREATE POLICY telehealth_select_policy ON telehealth_sessions
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS telehealth_sessions_patient_id_idx ON telehealth_sessions(patient_id);
CREATE INDEX IF NOT EXISTS telehealth_sessions_appointment_id_idx ON telehealth_sessions(appointment_id);
