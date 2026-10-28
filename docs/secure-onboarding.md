# Secure onboarding rollout

This change is not effective on the live site until the database migration, Edge Functions, and frontend are deployed together. GitHub/Lovable frontend sync alone is insufficient.

## Deployment order

1. Apply `supabase/migrations/20261029000000_secure_onboarding.sql` to the existing Supabase project. This immediately blocks public packet inserts and document reads/uploads. Existing packets and employment applications remain intact. Public employment applications still work.
2. Deploy `get-applications`, `onboarding`, and `send-application-email`, including the shared privacy module. The existing `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` secrets are required. Never put service credentials into frontend variables. Preserve the project's existing gateway settings; `onboarding` accepts the same public client credentials as the existing functions and checks its own invitation token. Notifications additionally require the service-role Authorization header.
3. Publish the frontend. Expect a brief onboarding interruption between steps 1 and 3; do not leave the site in that intermediate state.
4. Verify in staging with synthetic applicant data: public URL shows the invitation requirement; a submitted application alone cannot unlock onboarding; admin approval creates a seven-day personal link; wrong-email, expired and reused links cannot submit; valid submission succeeds once; a second invitation cannot create a second packet for the same application; bank numbers are absent from list responses and details; reveal/hide and auto-hide work; downloads retain full numbers only after explicit action; uploaded documents require admin access; emails contain only a packet ID and dashboard link.

## Admin workflow

Review the employment application and complete hiring decisions first. Click **Approve for onboarding** for that applicant, confirm the approval, then copy the personal link and send it to the applicant through your usual channel. This code creates no outbound invitation messages. Treat the link as a bearer credential. Only its SHA-256 hash is stored in the database. It is single-use, expires after seven days, and submission must match the application email. Legacy packets are preserved without a retroactive relationship to applications.

Bank numbers are fetched only on **Reveal numbers**, hidden after 30 seconds, on focus loss, and on leaving the tab/dashboard. Full SSNs remain masked in list/detail views. Explicit confidential PDF downloads fetch one unredacted record for document generation. Document viewing obtains short-lived signed links through the password-checked admin API.

Onboarding drafts no longer persist in localStorage. Visiting onboarding deletes previous draft keys on that device. Server changes cannot remove copies already delivered in old emails, downloaded files, or other devices' browser storage. Existing database values are retained; this change controls access rather than introducing field-level encryption. The existing shared admin-password model remains in place.

If a document upload fails after the packet is saved, the UI tells the applicant to contact the hiring team. Do not ask them to resubmit a consumed invitation. A new secure upload/recovery flow is outside this change.

## Regression checks

Use Node 24+ and install the app dependencies. Tests invoke the actual Edge Function handlers with mocked service clients and execute the actual migration/function against an in-memory PostgreSQL instance. No production records or emails are used.

```sh
npm install --ignore-scripts --package-lock=false
npm install --prefix /tmp/kairos-security-tests --ignore-scripts --package-lock=false @electric-sql/pglite
PGLITE_MODULE=/tmp/kairos-security-tests/node_modules/@electric-sql/pglite/dist/index.js node --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```
