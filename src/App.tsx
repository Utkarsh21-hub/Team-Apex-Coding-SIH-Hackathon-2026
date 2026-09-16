import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginView } from './views/LoginView';
import { PublicVerifyView } from './views/PublicVerifyView';
import { ApplicantDashboardView } from './views/ApplicantDashboardView';
import { ApplicantInstrumentsView } from './views/ApplicantInstrumentsView';
import { OfficerQueueView } from './views/OfficerQueueView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CertificatesView } from './views/CertificatesView';
import { NotificationsView } from './views/NotificationsView';
import { UserRole } from './types';

// Helper component to redirect authenticated users to their role-specific dashboard
const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'applicant':
      return <Navigate to="/applicant" replace />;
    case 'lmo':
      return <Navigate to="/officer" replace />;
    case 'gatc':
      return <Navigate to="/gatc" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Protected route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <RoleRedirect />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Verification Route without authentication */}
          <Route path="/verify/:certificateNumber" element={<PublicVerifyView />} />

          {/* Login Route with Role Switcher */}
          <Route path="/login" element={<LoginView />} />

          {/* Protected Application Routes wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Root redirects to role dashboard */}
            <Route path="/" element={<RoleRedirect />} />

            {/* Applicant Portal */}
            <Route
              path="/applicant"
              element={
                <ProtectedRoute allowedRoles={['applicant', 'admin']}>
                  <ApplicantDashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/instruments"
              element={
                <ProtectedRoute allowedRoles={['applicant', 'admin']}>
                  <ApplicantInstrumentsView />
                </ProtectedRoute>
              }
            />

            {/* LMO / Field Officer Queue */}
            <Route
              path="/officer"
              element={
                <ProtectedRoute allowedRoles={['lmo', 'admin']}>
                  <OfficerQueueView />
                </ProtectedRoute>
              }
            />

            {/* GATC Lab Queue */}
            <Route
              path="/gatc"
              element={
                <ProtectedRoute allowedRoles={['gatc', 'admin']}>
                  <OfficerQueueView />
                </ProtectedRoute>
              }
            />

            {/* State Directorate / Admin Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardView />
                </ProtectedRoute>
              }
            />

            {/* Common Pages */}
            <Route path="/certificates" element={<CertificatesView />} />
            <Route path="/notifications" element={<NotificationsView />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
