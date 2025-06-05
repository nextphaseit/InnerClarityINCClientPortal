-- ✅ Ensure appointments.id is UNIQUE so it can be used as a foreign key
ALTER TABLE appointments
ADD CONSTRAINT appointments_id_unique UNIQUE (id);

-- ✅ Create telehealth_sessions table with TEXT appointment_id
CREATE TABLE IF NOT EXISTS telehealth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id TEXT NOT NULL REFERENCES appointments(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'joined',
  device_info JSONB,
  network_quality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ Enable Row Level Security
ALTER TABLE telehealth_sessions ENABLE ROW LEVEL SECURITY;

-- ✅ Policy: Allow patients to insert their own session records
CREATE POLICY telehealth_insert_policy ON telehealth_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- ✅ Policy: Allow patients to view only their own sessions
CREATE POLICY telehealth_select_policy ON telehealth_sessions
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
  );

-- ✅ Optional Policy: Allow patients to update their own sessions (e.g., set ended_at)
CREATE POLICY telehealth_update_policy ON telehealth_sessions
  FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (true);

-- ✅ Indexes for performance
CREATE INDEX IF NOT EXISTS telehealth_sessions_patient_id_idx ON telehealth_sessions(patient_id);
CREATE INDEX IF NOT EXISTS telehealth_sessions_appointment_id_idx ON telehealth_sessions(appointment_id);
