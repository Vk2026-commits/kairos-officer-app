-- Create table to store all application submissions
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  date_of_birth TEXT,
  ssn TEXT,
  
  -- I-9 Information
  citizenship_status TEXT,
  alien_registration_number TEXT,
  foreign_passport_number TEXT,
  country_of_issuance TEXT,
  work_authorization_expiration TEXT,
  uscis_number TEXT,
  
  -- Direct Deposit
  direct_deposit_consent BOOLEAN DEFAULT false,
  bank_name TEXT,
  routing_number TEXT,
  account_number TEXT,
  account_type TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_address TEXT,
  
  -- Employment Information
  desired_position TEXT,
  desired_salary TEXT,
  start_date TEXT,
  
  -- Background Information
  background_consent BOOLEAN DEFAULT false,
  background_signature TEXT,
  background_date TEXT,
  
  -- Policy Acknowledgements (stored as JSONB for flexibility)
  policy_acknowledgements JSONB DEFAULT '{}',
  
  -- Availability (stored as JSONB)
  availability JSONB DEFAULT '{}',
  
  -- Uniform Information
  uniform_shirt_size TEXT,
  uniform_pants_size TEXT,
  uniform_shoe_size TEXT,
  
  -- W-2 Information
  w2_filing_status TEXT,
  w2_allowances TEXT,
  w2_additional_withholding TEXT,
  
  -- Full form data as backup (stores complete submission)
  full_form_data JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public form)
CREATE POLICY "Anyone can submit applications"
ON public.applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view applications (we'll use service role in edge function)
-- No public SELECT policy - applications are private