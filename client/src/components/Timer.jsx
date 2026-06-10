import { formatTime } from '../utils/formatTime';

export default function Timer({ secondsLeft }) {
  const urgent = secondsLeft <= 300;
  const critical = secondsLeft <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
        critical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : urgent
            ? 'bg-amber-100 text-amber-800'
            : 'bg-brand-50 text-brand-700'
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatTime(secondsLeft)}
    </div>
  );
}
