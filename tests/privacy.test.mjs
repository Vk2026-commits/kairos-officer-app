import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redactNumbers, hashToken } from '../supabase/functions/_shared/privacy.ts';

test('redacts bank and SSN duplicates recursively without changing the source', () => {
  const input = { routing_number: '123456789', account_number: '9876543210', ssn: '111-22-3333',
    full_form_data: { routingNumber: '123456789', accountNumber: '9876543210', ssn: '111-22-3333', bankName: 'Example Bank', nested: [{ account_number: '9876543210' }] } };
  const output = redactNumbers(input);
  for (const secret of ['123456789', '9876543210', '111-22-3333']) assert.equal(JSON.stringify(output).includes(secret), false);
  assert.equal(output.full_form_data.bankName, 'Example Bank');
  assert.equal(input.routing_number, '123456789');
  assert.deepEqual(redactNumbers({ routingNumber: null, accountNumber: '' }), { routingNumber: null, accountNumber: '' });
});

test('invitation hashes are deterministic SHA-256, not raw bearer tokens', async () => {
  assert.equal(await hashToken('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
