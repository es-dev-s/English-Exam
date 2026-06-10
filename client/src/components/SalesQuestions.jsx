import WordCounter from './WordCounter';
import { isWithinLimit } from '../utils/wordCount';

export const SALES_QUESTIONS = [
  {
    id: 'q1',
    label: 'Q1. What motivates you to pursue a career in sales?',
    maxWords: 50,
    placeholder: 'Share your motivation in up to 50 words...',
  },
  {
    id: 'q2',
    label: 'Q2. A client stops responding after two follow-ups. What do you do?',
    maxWords: 50,
    placeholder: 'Describe your approach in up to 50 words...',
  },
  {
    id: 'q3',
    label: 'Q3. Describe one personal sales strength and one weakness.',
    maxWords: 50,
    placeholder: 'One strength and one weakness in up to 50 words...',
  },
  {
    id: 'q4',
    label: 'Q4. Explain what "customer value" means to you.',
    maxWords: 50,
    placeholder: 'Define customer value in up to 50 words...',
  },
  {
    id: 'q5',
    label: 'Q5. Create a weekly action plan based on leading 40 prospects (5 interested, 10 neutral, 10 declined).',
    maxWords: 250,
    placeholder: 'Outline your weekly plan in up to 250 words...',
    rows: 8,
  },
];

export function validateSalesAnswers(answers) {
  return SALES_QUESTIONS.every((q) => isWithinLimit(answers[q.id] || '', q.maxWords));
}

export default function SalesQuestions({ answers, onChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-900">
        <p className="font-semibold">Part 2: Sales Acumen (10 Marks)</p>
        <p className="mt-1 text-brand-700">
          Five descriptive questions worth 2 marks each. Answers are graded for sales strategy and English proficiency (IELTS/PTE standards).
        </p>
      </div>
      {SALES_QUESTIONS.map((q) => (
        <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <label htmlFor={q.id} className="block font-medium text-slate-900 mb-2">
            {q.label}
          </label>
          <textarea
            id={q.id}
            rows={q.rows || 3}
            value={answers[q.id] || ''}
            onChange={(e) => onChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
          />
          <WordCounter text={answers[q.id] || ''} maxWords={q.maxWords} />
        </div>
      ))}
    </div>
  );
}
