import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { APP_NAME } from '../config/branding';
import { PortalFooter } from './PortalShell';
import { switchPortal } from '../utils/portalStorage';

export default function AdminLayout() {
  const { username, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const handleSwitchPortal = () => {
    logout();
    switchPortal();
    navigate('/', { replace: true });
  };

  return (
    <div className="entegra-page-bg flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="entegra-logo">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">{APP_NAME}</p>
              <p className="text-xs text-slate-500">
                Admin · Results & Management
                {username && <span className="hidden sm:inline"> · {username}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSwitchPortal}
              className="text-xs sm:text-sm text-slate-500 hover:text-brand-600 transition-colors"
            >
              Switch portal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="entegra-btn-secondary text-sm py-1.5 px-3"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <PortalFooter>Admin access only · Candidate submissions appear after exam completion</PortalFooter>
    </div>
  );
}
