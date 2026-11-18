import { POSITION_OPTIONS } from '../shared/positions.js';
import { isWithinWordLimit } from '../utils/wordCount.js';
import { SALES_QUESTION_BANK } from '../shared/salesQuestions.js';
import { MCQ_COUNT, LISTENING_COUNT } from '../config/assessment.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MCQ_OPTIONS = new Set(['A', 'B', 'C', 'D']);

function validateMcqMap(answers, count, label, errors) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    errors.push(`${label} answers are required.`);
    return;
  }
  for (const [key, value] of Object.entries(answers)) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1 || id > count) {
      errors.push(`Invalid ${label} question id: ${key}.`);
      continue;
    }
    if (!MCQ_OPTIONS.has(String(value).toUpperCase())) {
      errors.push(`${label} answer for question ${id} must be A, B, C, or D.`);
    }
  }
}

export function validateAssessmentSubmission(body) {
  const errors = [];
  const {
    candidate,
    session_id: sessionId,
    mcq_answers,
    listening_answers,
    sales_answers,
  } = body || {};

  if (!sessionId || typeof sessionId !== 'string') {
    errors.push('Assessment session is required. Please restart the test.');
  }

  if (!candidate?.name?.trim()) {
    errors.push('Candidate name is required.');
  }

  if (!candidate?.email?.trim() || !EMAIL_RE.test(candidate.email.trim())) {
    errors.push('Valid email is required.');
  }

  if (!candidate?.phone?.trim()) {
    errors.push('Phone number is required.');
  }

  const position = candidate?.applied_position?.trim();
  if (!position) {
    errors.push('Applied position is required.');
  } else if (!POSITION_OPTIONS.includes(position)) {
    errors.push('Invalid applied position.');
  }

  validateMcqMap(mcq_answers, MCQ_COUNT, 'MCQ', errors);
  validateMcqMap(listening_answers || {}, LISTENING_COUNT, 'Listening', errors);

  if (sales_answers && typeof sales_answers === 'object' && !Array.isArray(sales_answers)) {
    for (const [key, value] of Object.entries(sales_answers)) {
      const text = value == null ? '' : String(value);
      const bankQ = SALES_QUESTION_BANK.find((q) => q.id === key);
      const maxWords = bankQ?.maxWords || 300;
      if (text.trim() && !isWithinWordLimit(text, maxWords)) {
        errors.push(`Writing answer ${key} exceeds the ${maxWords}-word limit.`);
      }
    }
  }

  return errors;
}
