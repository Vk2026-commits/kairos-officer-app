import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { redactNumbers, hashToken } from '../supabase/functions/_shared/privacy.ts';

async function loadHandler(path, db, extra = {}) {
  let handler;
  const source = (await readFile(new URL(`../supabase/functions/${path}/index.ts`, import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  vm.runInNewContext(js, { serve: fn => { handler = fn; }, createClient: () => db,
    Deno: { env: { get: key => ({ ADMIN_PASSWORD: 'test-password', SUPABASE_SERVICE_ROLE_KEY: 'test-service', SUPABASE_URL: 'https://example.test' })[key] } },
    Response, Request, crypto, redactNumbers, hashToken, console: { log() {}, error() {} }, ...extra });
  return handler;
}
const request = body => new Request('https://example.test', { method: 'POST', body: JSON.stringify(body) });

test('admin list is redacted; reveal/export require authentication and explicit action', async () => {
  const record = { id: 'test-id', routing_number: '123456789', account_number: '87654321', ssn: '123-45-6789', full_form_data: { routingNumber: '123456789', accountNumber: '87654321', ssn: '123-45-6789' } };
  const db = { from: () => ({ select() { return this; }, eq() { return this; }, order: async () => ({ data: [record] }), single: async () => ({ data: record }) }) };
  const handler = await loadHandler('get-applications', db);
  for (const action of ['list', 'reveal', 'export', 'documents', 'invite']) assert.equal((await handler(request({ action, password: 'wrong' }))).status, 401);
  const list = await handler(request({ password: 'test-password' }));
  const data = await list.json();
  for (const collection of ['applications', 'employmentApplications']) {
    assert.equal(JSON.stringify(data[collection]).includes('87654321'), false);
    assert.equal(JSON.stringify(data[collection]).includes('123-45-6789'), false);
  }
  assert.equal(list.headers.get('cache-control'), 'no-store');
  const revealed = await (await handler(request({ password: 'test-password', action: 'reveal', applicationId: 'test-id' }))).json();
  assert.equal(revealed.accountNumber, '87654321');
  assert.equal(revealed.ssn, undefined);
  const exported = await (await handler(request({ password: 'test-password', action: 'export', applicationId: 'test-id' }))).json();
  assert.equal(exported.application.account_number, '87654321');
});

test('notification rejects browser calls and sends only packet ID and dashboard link', async () => {
  let outbound;
  const handler = await loadHandler('send-application-email', { from: () => ({ select() { return this; }, eq() { return this; }, single: async () => ({ data: { id: 'test-id' } }) }) }, {
    fetch: async (_url, options) => { outbound = JSON.parse(options.body); return new Response('{}'); },
  });
  assert.equal((await handler(request({ id: 'test-id' }))).status, 401);
  const req = request({ id: 'test-id', fullFormData: { accountNumber: '87654321' } });
  req.headers.set('Authorization', 'Bearer test-service');
  assert.equal((await handler(req)).status, 200);
  assert.equal(JSON.stringify(outbound).includes('87654321'), false);
  assert.match(outbound.text, /test-id/);
});

test('onboarding rejects absent tokens and used/expired invitations before showing the form', async () => {
  const handler = await loadHandler('onboarding', { from: () => ({ select() { return this; }, eq() { return this; }, is() { return this; }, gt() { return this; }, maybeSingle: async () => ({ data: null }) }) });
  assert.equal((await handler(request({ action: 'validate' }))).status, 403);
  assert.equal((await handler(request({ action: 'validate', token: 'a'.repeat(64) }))).status, 403);
});

test('a saved packet stays successful when notification or upload-grant services fail', async () => {
  const handler = await loadHandler('onboarding', {
    rpc: async () => ({ data: 'saved-packet-id' }),
    functions: { invoke: async () => { throw new Error('mail unavailable'); } },
    storage: { from: () => ({ createSignedUploadUrl: async () => { throw new Error('storage unavailable'); } }) },
  });
  const response = await handler(request({ action: 'submit', token: 'a'.repeat(64), application: { first_name: 'Test' } }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.id, 'saved-packet-id');
  assert.equal(result.emailSent, false);
  assert.deepEqual(result.uploads, {});
});
