import { SALES_QUESTIONS } from '@shared/salesQuestions.js';
import WordCounter from './WordCounter';
import { isWithinLimit } from '../utils/wordCount';

export { SALES_QUESTIONS };

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
