
-- Create storage bucket for onboarding documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-documents', 'onboarding-documents', false);

-- Allow anyone to upload to the bucket (no auth required for this public form)
CREATE POLICY "Anyone can upload onboarding documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'onboarding-documents');

-- Allow anyone to read onboarding documents (for admin viewing)
CREATE POLICY "Anyone can read onboarding documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'onboarding-documents');
