import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      {user?.role === 'ADMIN' ? (
        <>{children}</>
      ) : (
        <Navigate to="/" replace />
      )}
    </ProtectedRoute>
  );
}
