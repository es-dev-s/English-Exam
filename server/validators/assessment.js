import { POSITION_OPTIONS } from '../../shared/positions.js';
import { SALES_QUESTIONS } from '../../shared/salesQuestions.js';
import { MCQ_QUESTIONS } from '../data/mcqs.seed.js';
import { isWithinWordLimit } from '../utils/wordCount.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MCQ_OPTIONS = new Set(['A', 'B', 'C', 'D']);
const MCQ_COUNT = MCQ_QUESTIONS.length;

export function validateAssessmentSubmission(body) {
  const errors = [];
  const { candidate, mcq_answers, sales_answers } = body || {};

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

  if (!mcq_answers || typeof mcq_answers !== 'object' || Array.isArray(mcq_answers)) {
    errors.push('MCQ answers are required.');
  } else {
    for (const [key, value] of Object.entries(mcq_answers)) {
      const id = Number(key);
      if (!Number.isInteger(id) || id < 1 || id > MCQ_COUNT) {
        errors.push(`Invalid MCQ question id: ${key}.`);
        continue;
      }
      if (!MCQ_OPTIONS.has(String(value).toUpperCase())) {
        errors.push(`MCQ answer for question ${id} must be A, B, C, or D.`);
      }
    }
  }

  if (!sales_answers || typeof sales_answers !== 'object' || Array.isArray(sales_answers)) {
    errors.push('Sales answers are required.');
  } else {
    for (const q of SALES_QUESTIONS) {
      const answer = sales_answers[q.id];
      if (answer !== undefined && answer !== null && !isWithinWordLimit(String(answer), q.maxWords)) {
        errors.push(`${q.label.split('.')[0]} exceeds the ${q.maxWords}-word limit.`);
      }
    }
  }

  return errors;
}
