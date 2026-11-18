import { MCQ_ANSWER_KEY, MCQ_QUESTIONS } from '../data/mcqs.seed.js';

/**
 * Grade MCQs for a randomized set.
 * @param {Record<string, string>} answers - keyed by display id "1".."20"
 * @param {number[]} poolIds - selected pool question ids in display order
 */
export function gradeMcqs(answers = {}, poolIds = null) {
  const ids = poolIds?.length
    ? poolIds
    : MCQ_QUESTIONS.map((q) => q.id);

  const breakdown = [];
  let mcq_score = 0;

  ids.forEach((poolId, index) => {
    const displayId = index + 1;
    const expected = MCQ_ANSWER_KEY[poolId];
    const given = answers[String(displayId)]?.toUpperCase() ?? null;
    const correct = given === expected;
    if (correct) mcq_score += 1;
    breakdown.push({
      id: displayId,
      poolId,
      correct,
      expected,
      given,
    });
  });

  return { mcq_score, breakdown };
}

export function buildMcqReport(breakdown) {
  return breakdown.map((item) => {
    const q = MCQ_QUESTIONS.find((m) => m.id === item.poolId);
    return {
      id: item.id,
      poolId: item.poolId,
      difficulty: q?.difficulty,
      question: q?.question ?? '',
      options: q?.options ?? {},
      your_answer: item.given,
      correct_answer: item.expected,
      is_correct: item.correct,
      your_answer_text: item.given ? q?.options?.[item.given] ?? null : null,
      correct_answer_text: q?.options?.[item.expected] ?? null,
    };
  });
}
