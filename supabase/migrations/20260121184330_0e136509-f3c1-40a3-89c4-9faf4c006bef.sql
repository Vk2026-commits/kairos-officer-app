-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;

-- Create a new permissive INSERT policy that allows anyone to submit applications
CREATE POLICY "Anyone can submit applications" 
ON public.applications 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);