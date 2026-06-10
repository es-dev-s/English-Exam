import { Fragment, useCallback, useEffect, useState } from 'react';
import { fetchAdminResults } from '../../api/client';
import { SALES_QUESTIONS } from '../../components/SalesQuestions';
import CvUploadSection from '../../components/CvUploadSection';

export default function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const loadResults = useCallback(() => {
    return fetchAdminResults()
      .then((data) => setResults(data.results))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadResults().finally(() => setLoading(false));
  }, [loadResults]);

  const handleCvUploaded = (resultId, cvData) => {
    setResults((prev) =>
      prev.map((r) =>
        r.result_id === resultId
          ? { ...r, cv_stored_name: cvData.cv_stored_name, cv_original_name: cvData.cv_original_name }
          : r
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Assessment Results</h1>
        <p className="text-slate-600 mt-1">
          All candidate submissions appear here after they complete and submit the exam.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Submissions" value={results.length} />
        <StatCard label="Passed" value={results.filter((r) => r.passed).length} color="emerald" />
        <StatCard label="Failed" value={results.filter((r) => !r.passed).length} color="red" />
        <StatCard
          label="Avg. Score"
          value={results.length ? (results.reduce((s, r) => s + r.total_score, 0) / results.length).toFixed(1) : '—'}
        />
      </div>

      {results.length === 0 ? (
        <div className="entegra-card p-12 text-center text-slate-500">
          No results yet. They will appear here when candidates submit their assessments.
        </div>
      ) : (
        <div className="entegra-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">MCQ</th>
                  <th className="px-4 py-3 font-medium">Sales</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Band</th>
                  <th className="px-4 py-3 font-medium">CV</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <Fragment key={r.result_id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{r.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.applied_position || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{r.email}</td>
                      <td className="px-4 py-3 text-slate-600">{r.test_date}</td>
                      <td className="px-4 py-3">{r.mcq_score}/40</td>
                      <td className="px-4 py-3">{r.sales_score}/10</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.total_score}/50</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px]">{r.ielts_pte_equivalent_band}</td>
                      <td className="px-4 py-3">
                        {r.cv_original_name ? (
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Uploaded</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === r.result_id ? null : r.result_id)}
                          className="text-brand-600 hover:underline text-xs"
                        >
                          {expanded === r.result_id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expanded === r.result_id && (
                      <tr className="bg-slate-50">
                        <td colSpan={11} className="px-4 py-4">
                          <DetailPanel
                            result={r}
                            onCvUploaded={(cvData) => handleCvUploaded(r.result_id, cvData)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    default: 'text-slate-900',
  };
  return (
    <div className="entegra-card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || colors.default}`}>{value}</p>
    </div>
  );
}

function DetailPanel({ result, onCvUploaded }) {
  const salesAnswers = result.sales_answers || {};
  const mcqAnswers = result.mcq_answers || {};

  return (
    <div className="space-y-6 text-sm">
      <CvUploadSection result={result} onUploaded={onCvUploaded} />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Candidate Details</h3>
          <ul className="space-y-1 text-slate-600">
            <li>Position: <strong className="text-slate-900">{result.applied_position || '—'}</strong></li>
            <li>Phone: <strong className="text-slate-900">{result.phone || '—'}</strong></li>
            <li>MCQ Score: <strong className="text-slate-900">{result.mcq_score}/40</strong></li>
            <li>Sales Score: <strong className="text-slate-900">{result.sales_score}/10</strong></li>
            <li>Total: <strong className="text-slate-900">{result.total_score}/50</strong></li>
            <li>IELTS/PTE Band: <strong className="text-slate-900">{result.ielts_pte_equivalent_band}</strong></li>
            <li>Submitted: {new Date(result.submitted_at).toLocaleString()}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Sales Feedback</h3>
          <p className="text-slate-600 leading-relaxed">{result.sales_feedback}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Part 2 — Candidate Answers</h3>
        <div className="space-y-3">
          {SALES_QUESTIONS.map((q, idx) => {
            const score = result.sales_question_scores?.find((s) => s.question_id === idx + 1);
            const answer = salesAnswers[q.id]?.trim();
            return (
              <div key={q.id} className="entegra-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-slate-900">{q.label}</p>
                  {score && (
                    <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                      {score.total}/2 · Sales {score.sales_mark} · English {score.english_mark}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {answer || <span className="text-slate-400 italic">No answer provided</span>}
                </p>
                {score?.brief_feedback && (
                  <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2">{score.brief_feedback}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Part 1 — MCQ Answers</h3>
        <div className="entegra-card p-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((id) => {
              const given = mcqAnswers[String(id)];
              return (
                <div
                  key={id}
                  className={`text-center rounded-lg px-1 py-2 text-xs border ${
                    given ? 'border-slate-200 bg-white text-slate-800' : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">Q{id}</span>
                  <span className="font-semibold">{given || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
