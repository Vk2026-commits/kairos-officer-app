-- Existing packets remain available. New packets require a single-use invitation
-- explicitly issued by an administrator against an existing hiring application.
CREATE TABLE public.onboarding_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employment_application_id uuid NOT NULL REFERENCES public.employment_applications(id),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.onboarding_invitations FROM anon, authenticated;
ALTER TABLE public.applications ADD COLUMN employment_application_id uuid UNIQUE
  REFERENCES public.employment_applications(id);
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
REVOKE INSERT ON public.applications FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can read onboarding documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload onboarding documents" ON storage.objects;

-- Lock and consume the invitation in the same transaction as the insert so that
-- concurrent/replayed submissions cannot reuse it. Only the Edge Function calls this.
CREATE FUNCTION public.submit_invited_onboarding(invitation_hash text, payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invitation public.onboarding_invitations;
  applicant public.employment_applications;
  packet public.applications;
BEGIN
  SELECT * INTO invitation FROM public.onboarding_invitations
    WHERE token_hash = invitation_hash FOR UPDATE;
  IF NOT FOUND OR invitation.used_at IS NOT NULL OR invitation.expires_at <= now() THEN
    RAISE EXCEPTION 'Invalid or expired onboarding invitation';
  END IF;
  SELECT * INTO STRICT applicant FROM public.employment_applications
    WHERE id = invitation.employment_application_id;
  IF lower(trim(coalesce(payload->>'email', ''))) <> lower(trim(coalesce(applicant.email, '')))
    OR coalesce(trim(applicant.email), '') = '' THEN
    RAISE EXCEPTION 'Use the email address on your employment application';
  END IF;
  IF jsonb_typeof(payload->'full_form_data') IS DISTINCT FROM 'object'
    OR coalesce(trim(payload->>'first_name'), '') = ''
    OR coalesce(trim(payload->>'last_name'), '') = '' THEN
    RAISE EXCEPTION 'Incomplete onboarding packet';
  END IF;
  SELECT * INTO packet FROM jsonb_populate_record(NULL::public.applications,
    payload || jsonb_build_object('id', gen_random_uuid(), 'created_at', now(),
      'employment_application_id', applicant.id));
  INSERT INTO public.applications SELECT packet.*;
  UPDATE public.onboarding_invitations SET used_at = now() WHERE id = invitation.id;
  RETURN packet.id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_invited_onboarding(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_invited_onboarding(text, jsonb) TO service_role;
