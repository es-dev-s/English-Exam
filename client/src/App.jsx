import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import CandidateLayout from './components/CandidateLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedCandidateRoute from './components/ProtectedCandidateRoute';
import ProtectedAdminPortalRoute from './components/ProtectedAdminPortalRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PortalSelection from './pages/PortalSelection';
import Onboarding from './pages/Onboarding';
import Test from './pages/Test';
import Result from './pages/Result';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/" element={<PortalSelection />} />

        <Route element={<ProtectedCandidateRoute />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate" element={<Onboarding />} />
            <Route path="/candidate/test" element={<Test />} />
            <Route path="/candidate/result" element={<Result />} />
          </Route>
        </Route>

        <Route element={<ProtectedAdminPortalRoute />}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
