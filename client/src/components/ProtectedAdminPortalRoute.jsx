import { Navigate, Outlet } from 'react-router-dom';
import { getSelectedPortal, PORTALS } from '../utils/portalStorage';

export default function ProtectedAdminPortalRoute() {
  if (getSelectedPortal() !== PORTALS.ADMIN) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
