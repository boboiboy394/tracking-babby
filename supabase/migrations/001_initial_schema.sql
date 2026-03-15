-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'nurse', 'clinic')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHILDREN
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  clinic_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRACKING RECORDS
CREATE TABLE IF NOT EXISTS tracking_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('feeding', 'milestone', 'vaccination', 'growth', 'sleep')),
  record_date TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI CHAT
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Parents see own children" ON children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents insert own children" ON children
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents update own children" ON children
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Parents delete own children" ON children
  FOR DELETE USING (parent_id = auth.uid());

-- For clinics - see linked children
CREATE POLICY "Clinics see linked children" ON children
  FOR SELECT USING (clinic_id = auth.uid());

-- Tracking records policies
CREATE POLICY "Parents see own tracking records" ON tracking_records
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents insert tracking records" ON tracking_records
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents update tracking records" ON tracking_records
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents delete tracking records" ON tracking_records
  FOR DELETE USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Chat policies
CREATE POLICY "Parents see own chat sessions" ON chat_sessions
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents create chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents see own chat messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_tracking_records_child_id ON tracking_records(child_id);
CREATE INDEX idx_tracking_records_type ON tracking_records(record_type);
CREATE INDEX idx_tracking_records_date ON tracking_records(record_date);
CREATE INDEX idx_chat_sessions_child_id ON chat_sessions(child_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
