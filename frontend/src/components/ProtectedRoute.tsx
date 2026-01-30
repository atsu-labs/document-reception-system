import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, token, isLoading, loadUserFromToken } = useAuthStore();
  const location = useLocation();

  // Load user from token on mount if token exists but user is not loaded
  useEffect(() => {
    if (token && !user && !isLoading) {
      loadUserFromToken();
    }
  }, [token, user, isLoading, loadUserFromToken]);

  // If a token exists in localStorage but user is not yet loaded,
  // show loading state while `loadUserFromToken` runs to avoid
  // a transient redirect to `/login` on initial render.
  const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Show loading state while checking authentication
  if (isLoading || (!user && localToken)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
