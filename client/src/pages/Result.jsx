import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MCQ_MARKS, PASSING_MARK, SALES_MARKS, TOTAL_MARKS } from '../config/assessment';

export default function Result() {
  const result = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('lastResult') || 'null');
    } catch {
      return null;
    }
  }, []);

  if (!result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">No result found.</p>
        <Link to="/candidate" className="mt-4 inline-block text-brand-600 hover:underline">
          Return to onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className={`rounded-2xl p-8 text-center ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {result.passed ? (
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {result.passed ? 'Congratulations — You Passed!' : 'Assessment Complete — Did Not Pass'}
        </h1>
        <p className="mt-2 text-slate-600">
          {result.candidate?.name} · Passing mark: {PASSING_MARK}/{TOTAL_MARKS}
        </p>
        <p className="mt-4 text-4xl font-bold text-slate-900">
          {result.total_score}<span className="text-lg text-slate-500">/{TOTAL_MARKS}</span>
        </p>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <ScoreCard label="Part 1: MCQ Score" value={`${result.mcq_score}/${MCQ_MARKS}`} />
        <ScoreCard label="Part 2: Sales Score" value={`${result.sales_score}/${SALES_MARKS}`} />
        <ScoreCard label="IELTS/PTE Equivalent" value={result.ielts_pte_equivalent_band} wide />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 mb-4">
          Your submission has been recorded. Detailed results are reviewed by the assessment team.
        </p>
        <Link to="/candidate" className="entegra-btn-secondary inline-block">
          Done
        </Link>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, wide }) {
  return (
    <div className={`entegra-card p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
