import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import PasswordChange from './pages/PasswordChange';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotificationList from './pages/notifications/NotificationList';
import NotificationForm from './pages/notifications/NotificationForm';
import NotificationDetail from './pages/notifications/NotificationDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loadUserFromToken } = useAuthStore();

  // Load user from token on app start
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/password-change"
          element={
            <ProtectedRoute>
              <PasswordChange />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/new"
          element={
            <ProtectedRoute>
              <NotificationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/:id"
          element={
            <ProtectedRoute>
              <NotificationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/:id/edit"
          element={
            <ProtectedRoute>
              <NotificationForm />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
