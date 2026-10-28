import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
// Optional external installation keeps the application bundle/dependencies unchanged.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');

test('database enforces invitations and blocks public packet/document access', async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE SCHEMA storage;
      CREATE TABLE storage.buckets(id text primary key, name text, public boolean);
      CREATE TABLE storage.objects(id uuid, bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      GRANT USAGE ON SCHEMA public, storage TO anon, authenticated, service_role;
      GRANT ALL ON storage.objects TO anon, authenticated;`);
    for (const path of [
      '20260115195451_26383ef7-321f-4ab2-b466-e693a2ac2409.sql',
      '20260121184330_0e136509-f3c1-40a3-89c4-9faf4c006bef.sql',
      '20260403194828_f3f48bcd-86f5-45b2-a092-c966d2a4ef10.sql',
      '20260406155113_81343d96-fca4-4502-9eda-eb950abfda2a.sql',
    ]) await db.exec(await readFile(new URL(`../supabase/migrations/${path}`, import.meta.url), 'utf8'));
    await db.exec('GRANT ALL ON public.applications TO anon, authenticated;');
    await db.exec(await readFile(new URL('../supabase/migrations/20261029000000_secure_onboarding.sql', import.meta.url), 'utf8'));
    const applicantId = '00000000-0000-4000-8000-000000000001';
    await db.query(`INSERT INTO employment_applications(id,first_name,last_name,email,full_form_data) VALUES ($1,'Test','Applicant','applicant@example.test','{}')`, [applicantId]);
    await db.query(`INSERT INTO onboarding_invitations(employment_application_id,token_hash) VALUES ($1,'valid'),($1,'other')`, [applicantId]);
    await db.query(`INSERT INTO onboarding_invitations(employment_application_id,token_hash,expires_at) VALUES ($1,'expired',now()-interval '1 day')`, [applicantId]);
    const payload = { first_name: 'Test', last_name: 'Applicant', email: 'APPLICANT@example.test', full_form_data: { accountNumber: '12345678' } };
    const submit = (token, data = payload) => db.query('SELECT submit_invited_onboarding($1,$2::jsonb) AS id', [token, JSON.stringify(data)]);
    await assert.rejects(submit('missing'), /Invalid or expired/);
    await assert.rejects(submit('expired'), /Invalid or expired/);
    await assert.rejects(submit('valid', { ...payload, email: 'someoneelse@example.test' }), /email address/);
    await assert.rejects(submit('valid', { ...payload, full_form_data: null }), /Incomplete/);
    const result = await submit('valid', { ...payload, employment_application_id: '00000000-0000-4000-8000-000000000099' });
    const packet = (await db.query('SELECT * FROM applications WHERE id=$1', [result.rows[0].id])).rows[0];
    assert.equal(packet.employment_application_id, applicantId);
    await assert.rejects(submit('valid'), /Invalid or expired/);
    await assert.rejects(submit('other'), /duplicate key/);
    assert.equal((await db.query("SELECT used_at FROM onboarding_invitations WHERE token_hash='other'")).rows[0].used_at, null);
    await db.exec("INSERT INTO storage.objects VALUES(gen_random_uuid(),'onboarding-documents'); SET ROLE anon;");
    await assert.rejects(db.exec("INSERT INTO applications(first_name,last_name,full_form_data) VALUES('Bypass','Attempt','{}')"), /permission denied/);
    await assert.rejects(submit('other'), /permission denied/);
    assert.equal((await db.query('SELECT * FROM applications')).rows.length, 0);
    assert.equal((await db.query('SELECT * FROM storage.objects')).rows.length, 0);
    await assert.rejects(db.exec("INSERT INTO storage.objects VALUES(gen_random_uuid(),'onboarding-documents')"), /row-level security/);
    await assert.rejects(db.query('SELECT * FROM onboarding_invitations'), /permission denied/);
    await db.exec('RESET ROLE;');
  } finally { await db.close(); }
});
