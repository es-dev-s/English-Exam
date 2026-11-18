import { Fragment, useCallback, useEffect, useState } from 'react';
import { fetchAdminResultDetail, fetchAdminResults } from '../../api/client';
import { MCQ_MARKS, LISTENING_MARKS, SALES_MARKS, TYPING_MARKS, TOTAL_MARKS } from '../../config/assessment';
import { SALES_QUESTION_BANK } from '@shared/salesQuestions.js';
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
    <div className="entegra-shell py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment Results</h1>
          <p className="text-slate-600 mt-1">
            All candidate submissions appear here after they complete and submit the exam.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
        <div className="entegra-card overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">MCQ</th>
                  <th className="px-4 py-3 font-medium">Listening</th>
                  <th className="px-4 py-3 font-medium">Writing</th>
                  <th className="px-4 py-3 font-medium">Typing</th>
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
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{r.full_name}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.applied_position || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{r.email}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.test_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.mcq_score}/{MCQ_MARKS}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.listening_score ?? 0}/{LISTENING_MARKS}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.sales_score}/{SALES_MARKS}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.typing_score ?? 0}/{TYPING_MARKS}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.total_score}/{TOTAL_MARKS}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.ielts_pte_equivalent_band}</td>
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
                          className="text-brand-600 hover:underline text-xs font-medium whitespace-nowrap"
                        >
                          {expanded === r.result_id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expanded === r.result_id && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={13} className="px-4 sm:px-5 py-5">
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
    <div className="entegra-card p-4 sm:p-5 h-full">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold mt-1 ${colors[color] || colors.default}`}>{value}</p>
    </div>
  );
}

function McqSummary({ report }) {
  const correct = report.filter((item) => item.is_correct).length;
  const wrong = report.filter((item) => item.your_answer && !item.is_correct).length;
  const unanswered = report.filter((item) => !item.your_answer).length;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
        {correct} correct
      </span>
      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
        {wrong} wrong
      </span>
      {unanswered > 0 && (
        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
          {unanswered} unanswered
        </span>
      )}
    </div>
  );
}

function McqAnswerCard({ item }) {
  const answered = Boolean(item.your_answer);
  const isCorrect = item.is_correct;

  let cardClass = 'border-2 ';
  if (isCorrect) {
    cardClass += 'border-green-500 bg-green-50';
  } else if (answered) {
    cardClass += 'border-red-500 bg-red-50';
  } else {
    cardClass += 'border-amber-300 bg-amber-50';
  }

  return (
    <div className={`text-center rounded-lg px-1 py-2 text-xs ${cardClass}`}>
      <span className="block text-[10px] text-slate-600 font-medium">Q{item.id}</span>

      {isCorrect ? (
        <span className="block font-bold text-green-700 text-sm">{item.your_answer}</span>
      ) : answered ? (
        <>
          <span className="block font-bold text-red-700 text-sm line-through decoration-red-500">
            {item.your_answer}
          </span>
          <span className="block text-[10px] font-semibold text-green-700 mt-1">
            ✓ {item.correct_answer}
          </span>
        </>
      ) : (
        <>
          <span className="block font-semibold text-slate-400 text-sm">—</span>
          <span className="block text-[10px] font-semibold text-green-700 mt-1">
            ✓ {item.correct_answer}
          </span>
        </>
      )}
    </div>
  );
}

function DetailPanel({ result, onCvUploaded }) {
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    setDetailLoading(true);
    setDetailError('');
    fetchAdminResultDetail(result.result_id)
      .then(setDetail)
      .catch((err) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  }, [result.result_id]);

  const salesAnswers = result.sales_answers || {};
  const mcqReport = detail?.mcq_report || [];
  const listeningReport = detail?.listening_report || [];
  const typingResult = result.typing_result || detail?.typing_result;
  const writingIds = result.session_assignment?.writingIds || [];
  const writingQuestions = writingIds.length
    ? writingIds.map((id, index) => {
        const q = SALES_QUESTION_BANK.find((item) => item.id === id);
        return { ...q, slot: `q${index + 1}`, displayIndex: index + 1 };
      })
    : SALES_QUESTION_BANK.slice(0, 5).map((q, index) => ({
        ...q,
        slot: `q${index + 1}`,
        displayIndex: index + 1,
      }));

  const detailFields = [
    { label: 'Position', value: result.applied_position || '—' },
    { label: 'Phone', value: result.phone || '—' },
    { label: 'MCQ Score', value: `${result.mcq_score}/${MCQ_MARKS}` },
    { label: 'Listening Score', value: `${result.listening_score ?? 0}/${LISTENING_MARKS}` },
    { label: 'Writing Score', value: `${result.sales_score}/${SALES_MARKS}` },
    { label: 'Typing Score', value: `${result.typing_score ?? 0}/${TYPING_MARKS}` },
    { label: 'Total', value: `${result.total_score}/${TOTAL_MARKS}` },
    { label: 'IELTS/PTE Band', value: result.ielts_pte_equivalent_band },
    { label: 'Submitted', value: new Date(result.submitted_at).toLocaleString() },
  ];

  return (
    <div className="space-y-5 text-sm w-full">
      <CvUploadSection result={result} onUploaded={onCvUploaded} />

      <div className="grid xl:grid-cols-5 gap-4">
        <div className="entegra-card p-4 sm:p-5 xl:col-span-3">
          <h3 className="font-semibold text-slate-900 mb-3">Candidate Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {detailFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <dt className="text-xs text-slate-500">{field.label}</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="entegra-card p-4 sm:p-5 xl:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-3">Writing Feedback</h3>
          <p className="text-slate-600 leading-relaxed">{result.sales_feedback}</p>
          {typingResult && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">Typing Result</p>
              <p>WPM: <strong>{typingResult.wpm}</strong> · Accuracy: <strong>{typingResult.accuracy}%</strong></p>
              <p>
                Requirement met:{' '}
                <strong className={typingResult.meets_requirement ? 'text-emerald-700' : 'text-amber-700'}>
                  {typingResult.meets_requirement ? 'Yes' : 'No'}
                </strong>
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-900">Part 1 — MCQ Answers</h3>
          {!detailLoading && !detailError && mcqReport.length > 0 && (
            <McqSummary report={mcqReport} />
          )}
        </div>
        {detailLoading && <p className="text-slate-500">Loading answer breakdown...</p>}
        {detailError && <p className="text-red-600">{detailError}</p>}
        {!detailLoading && !detailError && mcqReport.length > 0 && (
          <>
            <AnswerLegend />
            <div className="entegra-card p-4 sm:p-5">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
                {mcqReport.map((item) => (
                  <McqAnswerCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-900">Part 2 — Listening Answers</h3>
          {!detailLoading && !detailError && listeningReport.length > 0 && (
            <McqSummary report={listeningReport} />
          )}
        </div>
        {!detailLoading && !detailError && listeningReport.length > 0 && (
          <>
            <AnswerLegend />
            <div className="entegra-card p-4 sm:p-5">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
                {listeningReport.map((item) => (
                  <McqAnswerCard key={`listening-${item.id}`} item={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Part 3 — Writing Answers</h3>
        <div className="grid lg:grid-cols-2 gap-3">
          {writingQuestions.map((q) => {
            const score = result.sales_question_scores?.find(
              (s) => s.question_id === q.displayIndex || s.bank_id === q.id
            );
            const answer = (salesAnswers[q.slot] || salesAnswers[q.id] || '').trim();
            return (
              <div key={q.id} className="entegra-card p-4 h-full flex flex-col">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-slate-900">Q{q.displayIndex}. {q.prompt}</p>
                  {score && (
                    <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                      {score.total}/3 · Sales {score.sales_mark} · English {score.english_mark}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap flex-1">
                  {answer || <span className="text-slate-400 italic">No answer provided</span>}
                </p>
                {score?.brief_feedback && (
                  <p className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-2">{score.brief_feedback}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnswerLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-3 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-green-500 border border-green-600" />
        Correct answer
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-red-500 border border-red-600" />
        Wrong answer
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-400" />
        Not answered
      </span>
    </div>
  );
}
