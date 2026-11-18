import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAssessment } from '../api/client';
import Timer from '../components/Timer';
import McqPage from '../components/McqPage';
import ListeningSection from '../components/ListeningSection';
import SalesQuestions, { validateSalesAnswers } from '../components/SalesQuestions';
import TypingTest from '../components/TypingTest';
import { useCountdown } from '../hooks/useCountdown';
import {
  ASSESSMENT_TIME_MINUTES,
  MCQ_MARKS,
  LISTENING_MARKS,
  SALES_MARKS,
  TYPING_MARKS,
} from '../config/assessment';

const MCQ_PAGES = [
  { label: 'Q1–10', start: 1, end: 10 },
  { label: 'Q11–20', start: 11, end: 20 },
];

export default function Test() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [listeningDialogue, setListeningDialogue] = useState(null);
  const [listeningQuestions, setListeningQuestions] = useState([]);
  const [writingQuestions, setWritingQuestions] = useState([]);
  const [typingPassage, setTypingPassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePart, setActivePart] = useState('part1');
  const [mcqPage, setMcqPage] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [salesAnswers, setSalesAnswers] = useState({});
  const [typing, setTyping] = useState({ typed_text: '', elapsed_seconds: 0 });
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
    if (!validateSalesAnswers(salesAnswers, writingQuestions)) {
      setError('One or more Part 3 answers exceed the maximum word limit. Please revise before submitting.');
      setActivePart('part3');
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      await submitAssessment({
        candidate,
        session_id: sessionId,
        mcq_answers: mcqAnswers,
        listening_answers: listeningAnswers,
        sales_answers: salesAnswers,
        typing,
      });
      sessionStorage.removeItem('candidate');
      sessionStorage.setItem(
        'lastResult',
        JSON.stringify({
          submitted: true,
          candidateName: candidate?.name,
        })
      );
      navigate('/candidate/result');
    } catch (err) {
      submittedRef.current = false;
      setError(err.message);
      setSubmitting(false);
    }
  }, [
    candidate,
    sessionId,
    mcqAnswers,
    listeningAnswers,
    salesAnswers,
    writingQuestions,
    typing,
    submitting,
    navigate,
  ]);

  const { secondsLeft } = useCountdown(timeLimitSeconds, handleSubmit);

  const loadQuestions = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchQuestions()
      .then((data) => {
        if (!data.listening?.dialogue || !Array.isArray(data.listening?.questions)) {
          throw new Error('Listening section missing from server response. Restart the API and try again.');
        }
        if (!data.typing?.text) {
          throw new Error('Typing passage missing from server response. Restart the API and try again.');
        }
        if (!Array.isArray(data.writingQuestions) || data.writingQuestions.length === 0) {
          throw new Error('Writing questions missing from server response. Restart the API and try again.');
        }
        setSessionId(data.sessionId);
        setQuestions(data.questions || []);
        setListeningDialogue(data.listening.dialogue);
        setListeningQuestions(data.listening.questions);
        setWritingQuestions(data.writingQuestions);
        setTypingPassage(data.typing);
        setSalesAnswers({});
        setMcqAnswers({});
        setListeningAnswers({});
        setTyping({ typed_text: '', elapsed_seconds: 0 });
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
  const listeningAnswered = Object.keys(listeningAnswers).length;
  const salesValid = validateSalesAnswers(salesAnswers, writingQuestions);
  const canSubmit = salesValid && !submitting && Boolean(sessionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600">Preparing your unique assessment...</p>
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
              MCQ {mcqAnswered}/{questions.length || MCQ_MARKS}
              {' · '}
              Listening {listeningAnswered}/{listeningQuestions.length || 10}
            </p>
            <p className="text-[11px] text-brand-600 mt-0.5 font-medium">
              4 sections · MCQ + Listening + Writing + Typing
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

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'part1', label: `1. MCQ (${MCQ_MARKS})` },
          { id: 'part2', label: `2. Listening (${LISTENING_MARKS})` },
          { id: 'part3', label: `3. Writing (${SALES_MARKS})` },
          { id: 'part4', label: `4. Typing (${TYPING_MARKS})` },
        ].map((part) => (
          <button
            key={part.id}
            type="button"
            onClick={() => setActivePart(part.id)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePart === part.id
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {part.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-4 mb-6">
        Sections loaded: Listening {listeningDialogue ? '✓' : '✗'} · Writing {writingQuestions.length}/5 · Typing{' '}
        {typingPassage ? '✓' : '✗'}
      </p>

      {activePart === 'part1' && (
        <>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-900 mb-4">
            <p className="font-semibold">Part 1: English MCQ (20 Marks)</p>
            <p className="mt-1 text-brand-700">
              20 questions randomly selected from a 100-question bank for this attempt.
            </p>
          </div>
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
              No questions available. Use Retry above if the API server was not running.
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
          <ListeningSection
            dialogue={listeningDialogue}
            questions={listeningQuestions}
            answers={listeningAnswers}
            onAnswer={(id, value) => setListeningAnswers((a) => ({ ...a, [String(id)]: value }))}
          />
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
              onClick={() => setActivePart('part3')}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
            >
              Go to Part 3
            </button>
          </div>
        </>
      )}

      {activePart === 'part3' && (
        <>
          <SalesQuestions
            questions={writingQuestions}
            answers={salesAnswers}
            onChange={(id, value) => setSalesAnswers((a) => ({ ...a, [id]: value }))}
          />
          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setActivePart('part2')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white"
            >
              Back to Part 2
            </button>
            <button
              type="button"
              onClick={() => setActivePart('part4')}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
            >
              Go to Part 4
            </button>
          </div>
        </>
      )}

      {activePart === 'part4' && (
        <>
          <TypingTest passage={typingPassage} value={typing} onChange={setTyping} />
          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setActivePart('part3')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white"
            >
              Back to Part 3
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
