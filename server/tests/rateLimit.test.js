import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { createMockReqResNext } from './helpers.js';

describe('createRateLimiter', () => {
  it('allows requests up to the configured maximum', () => {
    const store = new Map();
    let currentTime = 1_000;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      store,
      now: () => currentTime,
    });

    for (let i = 0; i < 2; i += 1) {
      const { req, res, next, wasNextCalled } = createMockReqResNext();
      limiter(req, res, next);
      assert.equal(wasNextCalled(), true);
      assert.equal(res.statusCode, 200);
    }
  });

  it('blocks requests above the limit with 429 and Retry-After', () => {
    const store = new Map();
    let currentTime = 1_000;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: 'Slow down',
      store,
      now: () => currentTime,
    });

    for (let i = 0; i < 2; i += 1) {
      const attempt = createMockReqResNext();
      limiter(attempt.req, attempt.res, attempt.next);
    }

    const blocked = createMockReqResNext();
    limiter(blocked.req, blocked.res, blocked.next);

    assert.equal(blocked.wasNextCalled(), false);
    assert.equal(blocked.res.statusCode, 429);
    assert.equal(blocked.res.body.error, 'Slow down');
    assert.equal(blocked.res.getHeader('Retry-After'), '60');
  });

  it('resets the window after windowMs elapses', () => {
    const store = new Map();
    let currentTime = 1_000;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      store,
      now: () => currentTime,
    });

    const first = createMockReqResNext();
    limiter(first.req, first.res, first.next);
    assert.equal(first.wasNextCalled(), true);

    const blocked = createMockReqResNext();
    limiter(blocked.req, blocked.res, blocked.next);
    assert.equal(blocked.res.statusCode, 429);

    currentTime += 60_000;

    const afterReset = createMockReqResNext();
    limiter(afterReset.req, afterReset.res, afterReset.next);
    assert.equal(afterReset.wasNextCalled(), true);
    assert.equal(afterReset.res.statusCode, 200);
  });

  it('tracks limits separately per client key', () => {
    const store = new Map();
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      store,
    });

    const firstClient = createMockReqResNext({ ip: '1.1.1.1' });
    limiter(firstClient.req, firstClient.res, firstClient.next);
    assert.equal(firstClient.wasNextCalled(), true);

    const secondClient = createMockReqResNext({ ip: '2.2.2.2' });
    limiter(secondClient.req, secondClient.res, secondClient.next);
    assert.equal(secondClient.wasNextCalled(), true);
  });
});
