function words(n, prefix = 'word') {
  return Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(' ');
}

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
    session_id: 'test-session-id',
    candidate: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 0100',
      applied_position: 'Sales Executive',
      test_date: '2026-06-11',
    },
    mcq_answers: { '1': 'A', '2': 'B' },
    listening_answers: { '1': 'C', '2': 'B' },
    sales_answers: {
      q1: words(110, 'motivation'),
      q2: words(110, 'followup'),
      q3: words(110, 'strength'),
      q4: words(110, 'value'),
      q5: words(120, 'plan'),
    },
    typing: {
      typed_text: 'sample typing text',
      elapsed_seconds: 60,
    },
    ...overrides,
  };
}
