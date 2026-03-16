-- Function to create profile (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'parent'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (user_id, user_email, user_full_name, user_role)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous to create profile (for signup flow)
CREATE POLICY "Allow service role to insert profiles" ON profiles
  FOR INSERT TO anon
  WITH CHECK (true);

-- Or alternatively disable RLS temporarily for profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
