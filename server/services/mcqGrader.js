import { MCQ_ANSWER_KEY, MCQ_QUESTIONS } from '../data/mcqs.seed.js';

/**
 * Grade MCQ answers against the hardcoded answer key.
 * @param {Record<string, string>} answers - { "1": "A", "2": "B", ... }
 * @returns {{ mcq_score: number, breakdown: Array<{ id: number, correct: boolean, expected: string, given: string|null }> }}
 */
export function gradeMcqs(answers = {}) {
  const breakdown = [];
  let mcq_score = 0;

  for (let id = 1; id <= MCQ_QUESTIONS.length; id++) {
    const expected = MCQ_ANSWER_KEY[id];
    const given = answers[String(id)]?.toUpperCase() ?? null;
    const correct = given === expected;
    if (correct) mcq_score += 1;
    breakdown.push({ id, correct, expected, given });
  }

  return { mcq_score, breakdown };
}

/** Build admin MCQ report with question text and correct answers */
export function buildMcqReport(breakdown) {
  return breakdown.map((item) => {
    const q = MCQ_QUESTIONS.find((m) => m.id === item.id);
    return {
      id: item.id,
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
