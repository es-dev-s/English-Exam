export const SALES_QUESTIONS = [
  {
    id: 'q1',
    questionId: 1,
    label: 'Q1. What motivates you to pursue a career in sales?',
    prompt: 'What motivates you to pursue a career in sales?',
    maxWords: 50,
    placeholder: 'Share your motivation in up to 50 words...',
  },
  {
    id: 'q2',
    questionId: 2,
    label: 'Q2. A client stops responding after two follow-ups. What do you do?',
    prompt: 'A client stops responding after two follow-ups. What do you do?',
    maxWords: 50,
    placeholder: 'Describe your approach in up to 50 words...',
  },
  {
    id: 'q3',
    questionId: 3,
    label: 'Q3. Describe one personal sales strength and one weakness.',
    prompt: 'Describe one personal sales strength and one weakness.',
    maxWords: 50,
    placeholder: 'One strength and one weakness in up to 50 words...',
  },
  {
    id: 'q4',
    questionId: 4,
    label: 'Q4. Explain what "customer value" means to you.',
    prompt: 'Explain what "customer value" means to you.',
    maxWords: 50,
    placeholder: 'Define customer value in up to 50 words...',
  },
  {
    id: 'q5',
    questionId: 5,
    label: 'Q5. Create a weekly action plan based on leading 40 prospects (5 interested, 10 neutral, 10 declined).',
    prompt: 'Create a weekly action plan based on leading 40 prospects (5 interested, 10 neutral, 10 declined).',
    maxWords: 250,
    placeholder: 'Outline your weekly plan in up to 250 words...',
    rows: 8,
  },
];

export function getSalesWordLimits() {
  return Object.fromEntries(SALES_QUESTIONS.map((q) => [q.id, q.maxWords]));
}
