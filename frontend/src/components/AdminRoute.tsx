import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

function AdminInner({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" replace />;
}

export default function AdminRoute({ children }: Props) {
  return (
    <ProtectedRoute>
      <AdminInner>{children}</AdminInner>
    </ProtectedRoute>
  );
}
