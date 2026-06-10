import { useNavigate } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../config/branding';
import { ASSESSMENT_TIME_MINUTES, PASSING_MARK, TOTAL_MARKS } from '../config/assessment';
import { clearCandidateSession, PORTALS, setSelectedPortal } from '../utils/portalStorage';
import { clearAdminSession } from '../utils/authStorage';
import { PortalFooter, PortalLogo } from '../components/PortalShell';

export default function PortalSelection() {
  const navigate = useNavigate();

  const selectCandidate = () => {
    clearAdminSession();
    clearCandidateSession();
    setSelectedPortal(PORTALS.CANDIDATE);
    navigate('/candidate');
  };

  const selectAdmin = () => {
    clearCandidateSession();
    clearAdminSession();
    setSelectedPortal(PORTALS.ADMIN);
    navigate('/admin/login');
  };

  return (
    <div className="entegra-page-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <PortalLogo size="lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{APP_NAME}</h1>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">{APP_TAGLINE}</p>
            <p className="text-slate-500 text-xs mt-2">
              {TOTAL_MARKS} marks · Pass {PASSING_MARK} · {ASSESSMENT_TIME_MINUTES} minutes
            </p>
          </div>

          <p className="text-center text-slate-600 text-sm mb-6">
            Select your portal to continue. You will only access the area you choose.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={selectCandidate}
              className="group text-left entegra-card p-6 border-2 border-transparent hover:border-brand-500 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Candidate</h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Register your details and take the English proficiency and sales assessment exam.
              </p>
              <span className="inline-block mt-4 text-brand-600 font-semibold text-sm group-hover:underline">
                Enter candidate portal →
              </span>
            </button>

            <button
              type="button"
              onClick={selectAdmin}
              className="group text-left entegra-card p-6 border-2 border-transparent hover:border-brand-500 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin</h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Sign in with credentials to view candidate results and assessment breakdowns.
              </p>
              <span className="inline-block mt-4 text-brand-600 font-semibold text-sm group-hover:underline">
                Enter admin portal →
              </span>
            </button>
          </div>
        </div>
      </div>
      <PortalFooter />
    </div>
  );
}
