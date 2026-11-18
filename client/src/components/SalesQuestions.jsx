import WordCounter from './WordCounter';
import { isWithinLimit } from '../utils/wordCount';

export function validateSalesAnswers(answers, questions = []) {
  return questions.every((q) => {
    const key = q.slot || q.id;
    return isWithinLimit(answers[key] || '', q.maxWords);
  });
}

export default function SalesQuestions({ questions = [], answers, onChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-900">
        <p className="font-semibold">Part 3: Writing — Sales Acumen (15 Marks)</p>
        <p className="mt-1 text-brand-700">
          Five randomly assigned sales questions × 3 marks each. Aim for at least 100 words per answer.
          Blank answers are allowed. Paste is disabled — type your answers directly.
        </p>
      </div>
      {questions.map((q, index) => {
        const key = q.slot || q.id;
        return (
          <div key={key} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <label htmlFor={key} className="block font-medium text-slate-900 mb-2">
              {q.displayLabel || `Q${index + 1}. ${q.prompt}`}
            </label>
            <textarea
              id={key}
              rows={q.rows || 6}
              value={answers[key] || ''}
              onChange={(e) => onChange(key, e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              placeholder={q.placeholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            />
            <WordCounter text={answers[key] || ''} minWords={q.minWords} maxWords={q.maxWords} />
          </div>
        );
      })}
    </div>
  );
}
