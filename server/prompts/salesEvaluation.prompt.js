import { SALES_QUESTION_BANK } from '../shared/salesQuestions.js';
import { WRITING_MARKS_PER_QUESTION, SALES_MARKS } from '../config/assessment.js';

/**
 * LLM grading for writing: each question max WRITING_MARKS_PER_QUESTION (default 3).
 */

export const SALES_EVALUATION_SYSTEM_PROMPT = `You are a senior sales hiring assessor and certified IELTS/PTE Academic examiner.

Grade candidate written responses for a Sales Writing assessment. Each response is worth exactly ${WRITING_MARKS_PER_QUESTION} marks, split as:
- ${WRITING_MARKS_PER_QUESTION / 2} mark(s) for SALES STRATEGY ALIGNMENT
- ${WRITING_MARKS_PER_QUESTION / 2} mark(s) for ENGLISH PROFICIENCY (IELTS/PTE Academic)

Allowed half-point increments only (e.g. 0, 0.5, 1, 1.5, 2, 2.5, 3).

Word-count rules:
- Each answer should be at least 100 words. Below 100: English mark max 0.5 and total capped at 1.5.
- Soft maximum 300 words. Over max: deduct from English mark; if >20% over, cap total at 1.5.

Return ONLY valid JSON:
{
  "question_scores": [
    { "question_id": 1, "bank_id": "wq1", "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" }
  ],
  "sales_score": number,
  "sales_feedback": "string (2-4 sentences)"
}

Ensure sales_score equals the sum of all question totals (max ${SALES_MARKS}).`;

export function buildSalesEvaluationUserPrompt(salesAnswers, writingQuestions) {
  const questions = (writingQuestions || SALES_QUESTION_BANK.slice(0, 5)).map((q, index) => ({
    id: index + 1,
    bank_id: q.id,
    prompt: q.prompt,
    minWords: q.minWords,
    maxWords: q.maxWords,
    answer: salesAnswers[q.slot] || salesAnswers[q.id] || '',
  }));

  return `Grade the following ${questions.length} sales writing assessment responses.

${questions.map((q) => `
--- Question ${q.id} [${q.bank_id}] (min ${q.minWords}, max ${q.maxWords} words) ---
Prompt: ${q.prompt}
Candidate answer (${countWords(q.answer)} words):
${q.answer || '[No answer provided]'}
`).join('\n')}

Apply the rubric strictly. Return JSON only.`;
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}
