import { Link } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../config/branding';

export function PortalLogo({ size = 'md' }) {
  const boxClass = size === 'lg' ? 'entegra-logo-lg' : 'entegra-logo';
  const textClass = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <div className={boxClass}>
      <span className={`text-white font-bold ${textClass}`}>E</span>
    </div>
  );
}

export function PortalHeader({ subtitle, homeTo, onSwitchPortal }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={homeTo} className="flex items-center gap-3">
          <PortalLogo />
          <div>
            <p className="font-semibold text-slate-900 leading-tight">{APP_NAME}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </Link>
        {onSwitchPortal && (
          <button
            type="button"
            onClick={onSwitchPortal}
            className="text-xs sm:text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            Switch portal
          </button>
        )}
      </div>
    </header>
  );
}

export function PortalFooter({ children }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      {children || `${APP_NAME} · ${APP_TAGLINE}`}
    </footer>
  );
}
