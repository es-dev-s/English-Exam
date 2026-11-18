import { LISTENING_BANK } from '../data/listening.bank.js';
import { LISTENING_MARKS_PER_QUESTION } from '../config/assessment.js';

export function gradeListening(answers = {}, listeningId = 1) {
  const dialogue = LISTENING_BANK.find((d) => d.id === listeningId) || LISTENING_BANK[0];
  const breakdown = [];
  let listening_score = 0;

  for (let id = 1; id <= dialogue.questions.length; id++) {
    const expected = dialogue.answerKey[id];
    const given = answers[String(id)]?.toUpperCase() ?? null;
    const correct = given === expected;
    if (correct) listening_score += LISTENING_MARKS_PER_QUESTION;
    breakdown.push({ id, correct, expected, given, listeningId: dialogue.id });
  }

  return { listening_score, breakdown, listeningId: dialogue.id };
}

export function buildListeningReport(breakdown, listeningId) {
  const dialogue = LISTENING_BANK.find((d) => d.id === listeningId) || LISTENING_BANK[0];
  return breakdown.map((item) => {
    const q = dialogue.questions.find((m) => m.id === item.id);
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
      marks: item.correct ? LISTENING_MARKS_PER_QUESTION : 0,
      max_marks: LISTENING_MARKS_PER_QUESTION,
    };
  });
}
