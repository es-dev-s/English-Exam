import { SALES_QUESTIONS } from '../../shared/salesQuestions.js';

/**
 * Exact LLM system + user prompt template for grading Part 2 descriptive answers.
 * Each question is scored out of 2 marks:
 *   - 1 mark: Sales strategy alignment
 *   - 1 mark: IELTS/PTE English (grammar, coherence, lexical resource)
 */

export const SALES_EVALUATION_SYSTEM_PROMPT = `You are a senior sales hiring assessor and certified IELTS/PTE Academic examiner.

Your task is to grade five candidate written responses for a Sales Acumen assessment. Each response is worth exactly 2 marks, split as follows:
- 1 mark for SALES STRATEGY ALIGNMENT: relevance, practicality, customer-centric thinking, pipeline discipline, and professional sales judgment.
- 1 mark for ENGLISH PROFICIENCY (IELTS/PTE Academic standards): grammatical accuracy, structural coherence, appropriate register, and lexical resource (vocabulary range and precision).

Scoring rules per question (0, 0.5, 1, 1.5, or 2 only — no other decimals):
- 2.0: Excellent sales insight AND clear, accurate, well-structured English within word limits.
- 1.5: Strong in one dimension, minor gaps in the other.
- 1.0: Adequate but basic; noticeable weaknesses in sales logic OR language.
- 0.5: Weak attempt; significant issues in both areas OR severely off-topic.
- 0.0: Blank, irrelevant, incoherent, or far exceeds word limit.

Word-limit violations:
- Q1–Q4 (max 50 words): deduct 0.5 from the English mark if over limit; cap total at 1.0 if more than 70 words.
- Q5 (max 250 words): deduct 0.5 from English mark if over limit; cap total at 1.0 if more than 320 words.

Return ONLY valid JSON matching this schema (no markdown, no commentary outside JSON):
{
  "question_scores": [
    { "question_id": 1, "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" },
    { "question_id": 2, "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" },
    { "question_id": 3, "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" },
    { "question_id": 4, "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" },
    { "question_id": 5, "sales_mark": number, "english_mark": number, "total": number, "brief_feedback": "string" }
  ],
  "sales_score": number,
  "sales_feedback": "string (2-4 sentences summarising strengths, gaps, and hiring recommendation for sales role)"
}

Ensure sales_score equals the sum of all question total values (max 10).`;

export function buildSalesEvaluationUserPrompt(salesAnswers) {
  const questions = SALES_QUESTIONS.map((q) => ({
    id: q.questionId,
    prompt: q.prompt,
    maxWords: q.maxWords,
    answer: salesAnswers[q.id] || '',
  }));

  return `Grade the following five sales assessment responses.

${questions.map((q) => `
--- Question ${q.id} (max ${q.maxWords} words) ---
Prompt: ${q.prompt}
Candidate answer (${countWords(q.answer)} words):
${q.answer || '[No answer provided]'}
`).join('\n')}

Apply the rubric strictly. Return JSON only.`;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
