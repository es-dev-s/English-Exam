import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedCorsOrigin } from '../utils/corsOrigins.js';

describe('isAllowedCorsOrigin', () => {
  let originalClientOrigin;

  beforeEach(() => {
    originalClientOrigin = process.env.CLIENT_ORIGIN;
  });

  afterEach(() => {
    if (originalClientOrigin === undefined) delete process.env.CLIENT_ORIGIN;
    else process.env.CLIENT_ORIGIN = originalClientOrigin;
  });

  it('allows localhost and private LAN origins', () => {
    delete process.env.CLIENT_ORIGIN;

    assert.equal(isAllowedCorsOrigin(undefined), true);
    assert.equal(isAllowedCorsOrigin('http://localhost:5173'), true);
    assert.equal(isAllowedCorsOrigin('http://192.168.1.42:5173'), true);
    assert.equal(isAllowedCorsOrigin('http://10.0.0.5:3010'), true);
    assert.equal(isAllowedCorsOrigin('https://public.example.com'), false);
  });

  it('allows explicit CLIENT_ORIGIN entries', () => {
    process.env.CLIENT_ORIGIN = 'https://exam.company.com, http://192.168.50.10:5173';

    assert.equal(isAllowedCorsOrigin('https://exam.company.com'), true);
    assert.equal(isAllowedCorsOrigin('http://192.168.50.10:5173'), true);
    assert.equal(isAllowedCorsOrigin('http://192.168.50.11:5173'), true);
  });
});
