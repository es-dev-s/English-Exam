export function createMockReqResNext({ ip = '127.0.0.1' } = {}) {
  const headers = {};
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    set(name, value) {
      headers[name] = value;
    },
    getHeader(name) {
      return headers[name];
    },
  };

  let nextCalled = false;
  let nextError = null;

  const next = (err) => {
    nextCalled = true;
    nextError = err ?? null;
  };

  const req = { ip, socket: { remoteAddress: ip } };

  return { req, res, next, headers, wasNextCalled: () => nextCalled, getNextError: () => nextError };
}

export function validSubmissionPayload(overrides = {}) {
  return {
    candidate: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 0100',
      applied_position: 'Sales Executive',
      test_date: '2026-06-11',
    },
    mcq_answers: { '1': 'A', '2': 'B' },
    sales_answers: {
      q1: 'Motivated by helping customers succeed.',
      q2: 'Follow up with value and ask for feedback.',
      q3: 'Strength: listening. Weakness: patience.',
      q4: 'Customer value means solving real problems.',
      q5: 'Weekly plan for 40 prospects with follow-ups.',
    },
    ...overrides,
  };
}
