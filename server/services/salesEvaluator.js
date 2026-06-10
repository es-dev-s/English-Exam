import OpenAI from 'openai';
import {
  SALES_EVALUATION_SYSTEM_PROMPT,
  buildSalesEvaluationUserPrompt,
} from '../prompts/salesEvaluation.prompt.js';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Fallback heuristic grading when no OpenAI API key is configured (dev/demo mode).
 */
function fallbackGrade(salesAnswers) {
  const limits = { q1: 50, q2: 50, q3: 50, q4: 50, q5: 250 };
  const question_scores = [];
  let sales_score = 0;

  for (let i = 1; i <= 5; i++) {
    const key = `q${i}`;
    const answer = (salesAnswers[key] || '').trim();
    const words = answer.split(/\s+/).filter(Boolean).length;
    const maxWords = limits[key];

    let sales_mark = 0;
    let english_mark = 0;

    if (answer.length > 0) {
      sales_mark = words >= 10 || (i === 5 && words >= 40) ? 0.75 : 0.5;
      english_mark = words <= maxWords ? 0.75 : 0.25;
      if (words > maxWords * 1.4) {
        sales_mark = Math.min(sales_mark, 0.5);
        english_mark = 0.25;
      }
    }

    const total = Math.min(2, sales_mark + english_mark);
    sales_score += total;
    question_scores.push({
      question_id: i,
      sales_mark,
      english_mark,
      total,
      brief_feedback: answer
        ? 'Auto-graded in demo mode. Configure OPENAI_API_KEY for full LLM evaluation.'
        : 'No answer provided.',
    });
  }

  return {
    question_scores,
    sales_score: Math.round(sales_score * 2) / 2,
    sales_feedback:
      'Demo-mode grading applied. Set OPENAI_API_KEY for detailed AI feedback on sales acumen and English proficiency.',
  };
}

/**
 * Evaluate Part 2 descriptive answers via LLM.
 */
export async function evaluateSalesAnswers(salesAnswers) {
  if (!openai) {
    return fallbackGrade(salesAnswers);
  }

  const userPrompt = buildSalesEvaluationUserPrompt(salesAnswers);

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

  const sales_score = parsed.question_scores.reduce(
    (sum, q) => sum + (q.total ?? 0),
    0
  );

  return {
    question_scores: parsed.question_scores,
    sales_score: Math.round(sales_score * 2) / 2,
    sales_feedback: parsed.sales_feedback || 'No summary feedback provided.',
  };
}
