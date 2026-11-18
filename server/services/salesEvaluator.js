import OpenAI from 'openai';
import { SALES_QUESTION_BANK, getSalesWordLimits } from '../shared/salesQuestions.js';
import {
  SALES_EVALUATION_SYSTEM_PROMPT,
  buildSalesEvaluationUserPrompt,
} from '../prompts/salesEvaluation.prompt.js';
import { countWords } from '../utils/wordCount.js';
import { WRITING_MARKS_PER_QUESTION } from '../config/assessment.js';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function clampHalf(value, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  const clamped = Math.max(0, Math.min(max, num));
  return Math.round(clamped * 2) / 2;
}

function normalizeQuestionScores(questionScores, expectedCount) {
  if (!Array.isArray(questionScores) || questionScores.length !== expectedCount) {
    throw new Error(`LLM response must include exactly ${expectedCount} question scores.`);
  }

  const halfMax = WRITING_MARKS_PER_QUESTION / 2;

  return questionScores.map((entry, index) => {
    const sales_mark = clampHalf(entry.sales_mark, halfMax);
    const english_mark = clampHalf(entry.english_mark, halfMax);
    const computedTotal = Math.min(
      WRITING_MARKS_PER_QUESTION,
      Math.round((sales_mark + english_mark) * 2) / 2
    );
    const total = Math.min(
      WRITING_MARKS_PER_QUESTION,
      Number(entry.total) || computedTotal
    );

    return {
      question_id: entry.question_id ?? index + 1,
      bank_id: entry.bank_id || null,
      sales_mark,
      english_mark,
      total,
      brief_feedback: String(entry.brief_feedback || ''),
    };
  });
}

function fallbackGrade(salesAnswers, writingQuestions) {
  const limits = getSalesWordLimits();
  const question_scores = [];
  let sales_score = 0;
  const halfMax = WRITING_MARKS_PER_QUESTION / 2;

  writingQuestions.forEach((q, index) => {
    const answer = (salesAnswers[q.slot] || salesAnswers[q.id] || '').trim();
    const words = countWords(answer);
    const { minWords, maxWords } = limits[q.id] || { minWords: 100, maxWords: 300 };

    let sales_mark = 0;
    let english_mark = 0;

    if (answer.length > 0) {
      sales_mark = words >= minWords ? halfMax * 0.75 : halfMax * 0.4;
      english_mark = words >= minWords && words <= maxWords ? halfMax * 0.75 : halfMax * 0.25;
      if (words > maxWords) {
        sales_mark = Math.min(sales_mark, halfMax * 0.5);
        english_mark = halfMax * 0.25;
      }
    }

    const total = Math.min(WRITING_MARKS_PER_QUESTION, Math.round((sales_mark + english_mark) * 2) / 2);
    sales_score += total;
    question_scores.push({
      question_id: index + 1,
      bank_id: q.id,
      sales_mark,
      english_mark,
      total,
      brief_feedback: answer
        ? 'Auto-graded in demo mode. Configure OPENAI_API_KEY for full LLM evaluation.'
        : 'No answer provided.',
    });
  });

  return {
    question_scores,
    sales_score: Math.round(sales_score * 2) / 2,
    sales_feedback:
      'Demo-mode grading applied. Set OPENAI_API_KEY for detailed AI feedback on sales acumen and English proficiency.',
  };
}

/**
 * Evaluate writing answers (up to 3 marks each).
 * @param {Record<string,string>} salesAnswers keyed by slot q1..q5 or bank id
 * @param {Array} writingQuestions assigned questions with slot + id
 */
export async function evaluateSalesAnswers(salesAnswers, writingQuestions = null) {
  const questions = writingQuestions?.length
    ? writingQuestions
    : SALES_QUESTION_BANK.slice(0, 5).map((q, i) => ({ ...q, slot: `q${i + 1}` }));

  if (!openai) {
    return fallbackGrade(salesAnswers, questions);
  }

  const userPrompt = buildSalesEvaluationUserPrompt(salesAnswers, questions);

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SALES_EVALUATION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from LLM evaluator');
  }

  const parsed = JSON.parse(content);
  const question_scores = normalizeQuestionScores(parsed.question_scores, questions.length);
  const sales_score = Math.round(
    question_scores.reduce((sum, q) => sum + q.total, 0) * 2
  ) / 2;

  return {
    question_scores,
    sales_score,
    sales_feedback: String(parsed.sales_feedback || 'No summary feedback provided.'),
  };
}
