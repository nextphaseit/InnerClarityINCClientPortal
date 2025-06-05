-- Comprehensive database schema fix script

-- 1. Fix profiles table
DO $$ 
BEGIN
    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'client_id') THEN
        ALTER TABLE profiles ADD COLUMN client_id UUID;
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID;
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Fix invoices table
DO $$ 
BEGIN
    -- Add patient_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'patient_id') THEN
        ALTER TABLE invoices ADD COLUMN patient_id UUID;
    END IF;

    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        ALTER TABLE invoices ADD COLUMN client_id UUID;
    END IF;

    -- Add invoice_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
        ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
    END IF;
END $$;

-- 3. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Fix RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create more flexible RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id OR 
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (client_id IS NOT NULL AND auth.uid() = client_id) OR
  auth.role() = 'service_role'
);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id OR 
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (client_id IS NOT NULL AND auth.uid() = client_id) OR
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (client_id IS NOT NULL AND auth.uid() = client_id) OR
  auth.role() = 'service_role'
);

-- 5. Fix storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simpler storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
