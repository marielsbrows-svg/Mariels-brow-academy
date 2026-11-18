import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { SetupNotice } from './components/SetupNotice';
import { HomePage } from './components/HomePage';
import { CoursesPage } from './components/CoursesPage';
import { CourseDetailPage } from './components/CourseDetailPage';
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage } from './components/AuthPages';

// If a password-reset email link drops the student anywhere other than the
// reset page, remember it here (before Supabase clears the link from the URL).
const cameFromRecoveryLink =
  typeof window !== 'undefined' && window.location.hash.includes('type=recovery');
import { StudentDashboard } from './components/StudentDashboard';
import { LessonViewer } from './components/LessonViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunityPage } from './components/CommunityPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mocha/20 border-t-mocha rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cameFromRecoveryLink && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideFooter = location.pathname.startsWith('/learn');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:courseId"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          {/* Any unknown URL goes home instead of rendering a blank page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
      <SetupNotice />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
