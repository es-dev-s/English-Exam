import { useEffect, useRef, useState } from 'react';
import { LISTENING_MARKS, LISTENING_MAX_PLAYS } from '../config/assessment';

export default function ListeningSection({ dialogue, questions = [], answers, onAnswer }) {
  if (!dialogue) {
    return (
      <div className="entegra-card p-8 text-center text-slate-600">
        Listening audio did not load for this session. Please refresh or use Retry.
      </div>
    );
  }

  const audioUrl = dialogue.audioUrl;
  const maxPlays = dialogue.maxPlays || LISTENING_MAX_PLAYS;

  return (
    <div className="space-y-6">
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-900">
        <p className="font-semibold">Part 2: Listening ({LISTENING_MARKS} Marks)</p>
        <p className="mt-1 text-brand-700">
          Listen to the audio (up to {maxPlays} plays), then answer 10 comprehension questions
          (1 mark each). The script is not shown. Male and female characters use different voices.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{dialogue.title}</h2>
        <p className="text-sm text-slate-600 mt-1">{dialogue.scenario}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          {(dialogue.speakers || []).map((s) => (
            <span key={s.id} className="bg-slate-100 rounded-full px-3 py-1">
              <strong className="text-slate-700">{s.name}</strong>
              {s.voice ? ` · ${s.voice}` : ''} — {s.role}
            </span>
          ))}
        </div>

        {audioUrl ? (
          <ListeningAudioPlayer src={audioUrl} maxPlays={maxPlays} />
        ) : (
          <p className="mt-4 text-sm text-red-600">Audio file URL missing for this dialogue.</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Comprehension Questions</h3>
        {questions.length === 0 ? (
          <p className="text-slate-500">No listening questions loaded.</p>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <fieldset key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <legend className="font-medium text-slate-900">
                    <span className="text-brand-600">Q{q.id}.</span> {q.question}
                  </legend>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 capitalize">
                    {q.difficulty || 'hard'} · 1 mark
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
                          name={`listening-${q.id}`}
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
        )}
      </div>
    </div>
  );
}

function ListeningAudioPlayer({ src, maxPlays }) {
  const audioRef = useRef(null);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [inSession, setInSession] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  const playsLeft = Math.max(0, maxPlays - playsUsed);
  const canStartNewPlay = playsLeft > 0 && !inSession;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.load();

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setInSession(false);
      setProgress(0);
      audio.currentTime = 0;
    };
    const onPause = () => {
      if (!audio.ended) setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onError = () => setError('Unable to load the listening audio. Please refresh and try again.');

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const audioSources = (() => {
    if (/\.mp3$/i.test(src)) {
      return [
        { src, type: 'audio/mpeg' },
        { src: src.replace(/\.mp3$/i, '.m4a'), type: 'audio/mp4' },
      ];
    }
    if (/\.m4a$/i.test(src)) {
      return [
        { src: src.replace(/\.m4a$/i, '.mp3'), type: 'audio/mpeg' },
        { src, type: 'audio/mp4' },
      ];
    }
    return [{ src }];
  })();

  const startPlay = async () => {
    const audio = audioRef.current;
    if (!audio || !canStartNewPlay) return;

    setError('');
    audio.currentTime = 0;
    setPlaysUsed((n) => n + 1);
    setInSession(true);

    try {
      await audio.play();
    } catch {
      setInSession(false);
      setPlaysUsed((n) => Math.max(0, n - 1));
      setError('Playback was blocked. Click Play again after interacting with the page.');
    }
  };

  const togglePauseResume = async () => {
    const audio = audioRef.current;
    if (!audio || !inSession) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setError('Could not resume playback.');
      }
    } else {
      audio.pause();
    }
  };

  const formatTime = (secs) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <audio ref={audioRef} preload="metadata">
        {audioSources.map((item) => (
          <source key={`${item.type}-${item.src}`} src={item.src} type={item.type} />
        ))}
      </audio>

      <div className="flex flex-wrap items-center gap-3">
        {!inSession ? (
          <button
            type="button"
            onClick={startPlay}
            disabled={!canStartNewPlay}
            className="entegra-btn-primary text-sm py-2 px-4 disabled:opacity-50"
          >
            {playsLeft > 0 ? 'Play audio' : 'No plays remaining'}
          </button>
        ) : (
          <button
            type="button"
            onClick={togglePauseResume}
            className="entegra-btn-secondary text-sm py-2 px-4"
          >
            {isPlaying ? 'Pause' : 'Resume'}
          </button>
        )}

        <span
          className={`text-sm font-medium ${
            playsLeft === 0 ? 'text-red-600' : playsLeft === 1 ? 'text-amber-600' : 'text-slate-600'
          }`}
        >
          {playsLeft} of {maxPlays} play{maxPlays === 1 ? '' : 's'} remaining
        </span>
      </div>

      <div className="mt-3">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-[width] duration-200"
            style={{ width: duration ? `${Math.min(100, (progress / duration) * 100)}%` : '0%' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Each press of Play counts as one listen. You may pause and resume within a play. Seeking is disabled.
      </p>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
