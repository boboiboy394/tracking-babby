-- Create storage bucket for moments
INSERT INTO storage.buckets (id, name, public)
VALUES ('moments', 'moments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload moments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'moments');

-- Create storage policy to allow authenticated users to view moments
CREATE POLICY IF NOT EXISTS "Authenticated users can view moments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'moments');

-- Create storage policy to allow authenticated users to delete moments
CREATE POLICY IF NOT EXISTS "Authenticated users can delete moments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'moments');
