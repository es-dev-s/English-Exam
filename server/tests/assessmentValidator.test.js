import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAssessmentSubmission } from '../validators/assessment.js';
import { validSubmissionPayload } from './helpers.js';

describe('validateAssessmentSubmission', () => {
  it('accepts a valid submission payload', () => {
    const errors = validateAssessmentSubmission(validSubmissionPayload());
    assert.deepEqual(errors, []);
  });

  it('rejects missing candidate name', () => {
    const payload = validSubmissionPayload({
      candidate: { ...validSubmissionPayload().candidate, name: '  ' },
    });
    assert.match(validateAssessmentSubmission(payload)[0], /name is required/i);
  });

  it('rejects invalid email addresses', () => {
    const payload = validSubmissionPayload({
      candidate: { ...validSubmissionPayload().candidate, email: 'not-an-email' },
    });
    assert.match(validateAssessmentSubmission(payload)[0], /valid email/i);
  });

  it('rejects invalid applied positions', () => {
    const payload = validSubmissionPayload({
      candidate: { ...validSubmissionPayload().candidate, applied_position: 'CEO' },
    });
    assert.match(validateAssessmentSubmission(payload)[0], /invalid applied position/i);
  });

  it('rejects invalid MCQ answer values', () => {
    const payload = validSubmissionPayload({
      mcq_answers: { '1': 'Z' },
    });
    assert.match(validateAssessmentSubmission(payload)[0], /must be A, B, C, or D/i);
  });

  it('rejects sales answers that exceed word limits', () => {
    const payload = validSubmissionPayload({
      sales_answers: {
        ...validSubmissionPayload().sales_answers,
        q1: Array.from({ length: 60 }, (_, i) => `word${i}`).join(' '),
      },
    });
    assert.match(validateAssessmentSubmission(payload)[0], /Q1 exceeds the 50-word limit/i);
  });
});
