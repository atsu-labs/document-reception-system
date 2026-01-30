import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'u1', username: 'admin', displayName: '管理者', role: 'ADMIN', departmentId: '', isActive: true, createdAt: '', updatedAt: '' }, token: 't', isLoading: false }),
}));

import AdminRoute from '../AdminRoute';

describe('AdminRoute', () => {
  it('renders children for admin user', () => {
    render(
      <AdminRoute>
        <div>secret</div>
      </AdminRoute>
    );

    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
