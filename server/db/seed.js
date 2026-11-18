import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initDb, closeDb } from './database.js';
import { MCQ_QUESTIONS, MCQ_ANSWER_KEY } from '../data/mcqs.seed.js';
import { LISTENING_BANK } from '../data/listening.bank.js';
import { SALES_QUESTION_BANK } from '../shared/salesQuestions.js';
import { TYPING_PASSAGES } from '../shared/typingPassages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

await initDb();

console.log('English Exam Portal — Seed Verification');
console.log(`MCQ questions: ${MCQ_QUESTIONS.length}`);
console.log(`MCQ answer keys: ${Object.keys(MCQ_ANSWER_KEY).length}`);
console.log(`Listening dialogues: ${LISTENING_BANK.length}`);
console.log(`Writing bank: ${SALES_QUESTION_BANK.length}`);
console.log(`Typing passages: ${TYPING_PASSAGES.length}`);

const byDifficulty = MCQ_QUESTIONS.reduce((acc, q) => {
  acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
  return acc;
}, {});
console.log('MCQ difficulty distribution:', byDifficulty);

if (MCQ_QUESTIONS.length !== 100) {
  console.error('Expected 100 MCQs');
  process.exit(1);
}

for (const d of LISTENING_BANK) {
  if (d.questions.length !== 10) {
    console.error(`Listening ${d.id} expected 10 questions`);
    process.exit(1);
  }
  for (const q of d.questions) {
    if (!d.answerKey[q.id] || !q.options[d.answerKey[q.id]]) {
      console.error(`Invalid listening answer for dialogue ${d.id} Q${q.id}`);
      process.exit(1);
    }
  }
}

console.log('Seed verification passed. PostgreSQL schema initialized.');
await closeDb();
