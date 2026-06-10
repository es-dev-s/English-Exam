import { getDb } from './database.js';
import { MCQ_QUESTIONS, MCQ_ANSWER_KEY } from '../data/mcqs.seed.js';

const db = getDb();

console.log('English Exam Portal — MCQ Seed Verification');
console.log(`Total questions: ${MCQ_QUESTIONS.length}`);
console.log(`Answer key entries: ${Object.keys(MCQ_ANSWER_KEY).length}`);

const byDifficulty = MCQ_QUESTIONS.reduce((acc, q) => {
  acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
  return acc;
}, {});

console.log('Difficulty distribution:', byDifficulty);
console.log('Expected: simple=20, intermediate=10, advanced=10');

const missingKeys = MCQ_QUESTIONS.filter((q) => !MCQ_ANSWER_KEY[q.id]);
if (missingKeys.length) {
  console.error('Missing answer keys for:', missingKeys.map((q) => q.id));
  process.exit(1);
}

console.log('Seed verification passed. Database schema initialized.');
