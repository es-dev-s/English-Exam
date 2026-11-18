import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TYPING_MIN_ACCURACY,
  TYPING_MIN_WPM,
  TYPING_MARKS,
} from '../config/assessment';

function calcStats(source, typed, elapsedSeconds) {
  const sourceChars = source.length;
  const typedChars = typed.length;
  let correct = 0;
  const len = Math.max(sourceChars, typedChars);
  for (let i = 0; i < len; i++) {
    if (typed[i] === source[i]) correct += 1;
  }
  const accuracy = typedChars === 0
    ? 100
    : Math.round((correct / Math.max(typedChars, sourceChars)) * 1000) / 10;
  const minutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
  const wpm = minutes > 0 ? Math.round(((correct / 5) / minutes) * 10) / 10 : 0;
  return { wpm, accuracy, correct, typedChars };
}

export default function TypingTest({ passage, value, onChange }) {
  const text = passage?.text || '';
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!startedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsedSeconds = startedAt ? Math.max(0, (now - startedAt) / 1000) : 0;
  const stats = useMemo(
    () => calcStats(text, value?.typed_text || '', elapsedSeconds),
    [text, value?.typed_text, elapsedSeconds]
  );

  const meets = stats.wpm >= TYPING_MIN_WPM && stats.accuracy >= TYPING_MIN_ACCURACY;

  const handleChange = (typed) => {
    const start = startedAt || Date.now();
    if (!startedAt) setStartedAt(start);
    const elapsed = Math.max(0, (Date.now() - start) / 1000);
    onChange({
      typed_text: typed,
      elapsed_seconds: Math.round(elapsed * 10) / 10,
      passage_id: passage?.id,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-900">
        <p className="font-semibold">Part 4: Typing Test ({TYPING_MARKS} Marks)</p>
        <p className="mt-1 text-brand-700">
          Type the passage below. Target: at least {TYPING_MIN_WPM} WPM with {TYPING_MIN_ACCURACY}% accuracy
          for full marks.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-900">{passage?.title || 'Typing passage'}</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {Math.round(elapsedSeconds)}s
            </span>
            <span className={`px-2 py-1 rounded-full ${stats.wpm >= TYPING_MIN_WPM ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
              {stats.wpm} WPM
            </span>
            <span className={`px-2 py-1 rounded-full ${stats.accuracy >= TYPING_MIN_ACCURACY ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
              {stats.accuracy}% accuracy
            </span>
            <span className={`px-2 py-1 rounded-full ${meets ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {meets ? 'Target met' : 'Below target'}
            </span>
          </div>
        </div>

        <div
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 max-h-56 overflow-y-auto whitespace-pre-wrap mb-4 select-none"
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {text}
        </div>

        <label htmlFor="typing-input" className="block font-medium text-slate-900 mb-2">
          Type here
        </label>
        <textarea
          ref={inputRef}
          id="typing-input"
          rows={10}
          value={value?.typed_text || ''}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Start typing the passage. Paste is disabled."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">
          Characters typed: {(value?.typed_text || '').length} / {text.length}. Paste is disabled — type the passage.
        </p>
      </div>
    </div>
  );
}
