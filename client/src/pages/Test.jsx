import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAssessment } from '../api/client';
import Timer from '../components/Timer';
import McqPage from '../components/McqPage';
import SalesQuestions, { validateSalesAnswers } from '../components/SalesQuestions';
import { useCountdown } from '../hooks/useCountdown';
import { ASSESSMENT_TIME_MINUTES } from '../config/assessment';

const MCQ_PER_PAGE = 10;

const MCQ_PAGES = [
  { label: 'Q1–10', start: 1, end: 10 },
  { label: 'Q11–20', start: 11, end: 20 },
  { label: 'Q21–30', start: 21, end: 30 },
  { label: 'Q31–40', start: 31, end: 40 },
];

export default function Test() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePart, setActivePart] = useState('part1');
  const [mcqPage, setMcqPage] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [salesAnswers, setSalesAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(ASSESSMENT_TIME_MINUTES * 60);
  const submittedRef = useRef(false);

  const candidate = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('candidate') || 'null');
    } catch {
      return null;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || submitting) return;
    if (!validateSalesAnswers(salesAnswers)) {
      setError('One or more Part 2 answers exceed the word limit. Please revise before submitting.');
      setActivePart('part2');
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await submitAssessment({
        candidate,
        mcq_answers: mcqAnswers,
        sales_answers: salesAnswers,
      });
      sessionStorage.setItem(
        'lastResult',
        JSON.stringify({
          candidate: result.candidate,
          mcq_score: result.mcq_score,
          sales_score: result.sales_score,
          total_score: result.total_score,
          passed: result.passed,
          ielts_pte_equivalent_band: result.ielts_pte_equivalent_band,
        })
      );
      navigate('/candidate/result');
    } catch (err) {
      submittedRef.current = false;
      setError(err.message);
      setSubmitting(false);
    }
  }, [candidate, mcqAnswers, salesAnswers, submitting, navigate]);

  const { secondsLeft } = useCountdown(timeLimitSeconds, handleSubmit);

  const loadQuestions = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchQuestions()
      .then((data) => {
        setQuestions(data.questions);
        if (data.timeLimitMinutes) {
          setTimeLimitSeconds(data.timeLimitMinutes * 60);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load questions. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!candidate) {
      navigate('/candidate');
      return;
    }
    loadQuestions();
  }, [candidate, navigate, loadQuestions]);

  const pageQuestions = useMemo(() => {
    const { start, end } = MCQ_PAGES[mcqPage];
    return questions.filter((q) => q.id >= start && q.id <= end);
  }, [questions, mcqPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mcqPage, activePart]);

  const mcqAnswered = Object.keys(mcqAnswers).length;
  const salesValid = validateSalesAnswers(salesAnswers);
  const canSubmit = salesValid && !submitting;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="sticky top-[73px] z-40 bg-slate-50/95 backdrop-blur border-b border-slate-200 -mx-4 px-4 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{candidate?.name}</p>
            <p className="text-xs text-slate-500">
              {candidate?.applied_position && <span>{candidate.applied_position} · </span>}
              MCQs answered: {mcqAnswered}/40
            </p>
          </div>
          <Timer secondsLeft={secondsLeft} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadQuestions}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActivePart('part1')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activePart === 'part1'
              ? 'bg-brand-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Part 1: English (40 marks)
        </button>
        <button
          type="button"
          onClick={() => setActivePart('part2')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activePart === 'part2'
              ? 'bg-brand-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Part 2: Sales (10 marks)
        </button>
      </div>

      {activePart === 'part1' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {MCQ_PAGES.map((page, idx) => (
              <button
                key={page.label}
                type="button"
                onClick={() => setMcqPage(idx)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  mcqPage === idx
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
          {pageQuestions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              No questions available for this page. Use Retry above if the API server was not running.
            </div>
          ) : (
            <McqPage
              questions={pageQuestions}
              answers={mcqAnswers}
              onAnswer={(id, value) => setMcqAnswers((a) => ({ ...a, [String(id)]: value }))}
            />
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              disabled={mcqPage === 0}
              onClick={() => setMcqPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-white"
            >
              Previous
            </button>
            {mcqPage < MCQ_PAGES.length - 1 ? (
              <button
                type="button"
                onClick={() => setMcqPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
              >
                Next Page
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActivePart('part2')}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              >
                Go to Part 2
              </button>
            )}
          </div>
        </>
      )}

      {activePart === 'part2' && (
        <>
          <SalesQuestions
            answers={salesAnswers}
            onChange={(id, value) => setSalesAnswers((a) => ({ ...a, [id]: value }))}
          />
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setActivePart('part1')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white"
            >
              Back to Part 1
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
