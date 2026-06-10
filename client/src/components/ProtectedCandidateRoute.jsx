import { Navigate, Outlet } from 'react-router-dom';
import { getSelectedPortal, PORTALS } from '../utils/portalStorage';

export default function ProtectedCandidateRoute() {
  if (getSelectedPortal() !== PORTALS.CANDIDATE) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
