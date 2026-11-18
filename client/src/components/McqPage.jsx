const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
  // legacy seeds (if any older results view them)
  simple: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

export default function McqPage({ questions, answers, onAnswer, idPrefix = 'mcq' }) {
  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <fieldset key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <legend className="font-medium text-slate-900">
              <span className="text-brand-600">Q{q.id}.</span> {q.question}
            </legend>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_STYLES[q.difficulty] || 'bg-slate-100 text-slate-600'}`}>
              {q.difficulty}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(q.options).map(([key, label]) => {
              const selected = answers[String(q.id)] === key;
              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-${q.id}`}
                    value={key}
                    checked={selected}
                    onChange={() => onAnswer(q.id, key)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-slate-700 w-6">{key}.</span>
                  <span className="text-slate-700">{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
