import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Result() {
  const submission = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('lastResult') || 'null');
    } catch {
      return null;
    }
  }, []);

  if (!submission?.submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">No submission found.</p>
        <Link to="/candidate" className="mt-4 inline-block text-brand-600 hover:underline">
          Return to onboarding
        </Link>
      </div>
    );
  }

  const name = submission.candidateName?.trim();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="rounded-2xl p-8 text-center bg-brand-50 border border-brand-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-brand-100">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Thank You for Submitting</h1>
        {name && (
          <p className="mt-2 text-slate-600">{name}</p>
        )}
        <p className="mt-4 text-slate-600 leading-relaxed">
          Your assessment has been received successfully. Our team will review your submission
          and contact you regarding the next steps.
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 mb-4">
          You may close this window. Results are not shown immediately and will be shared by the assessment team.
        </p>
        <Link to="/" className="entegra-btn-secondary inline-block">
          Done
        </Link>
      </div>
    </div>
  );
}
