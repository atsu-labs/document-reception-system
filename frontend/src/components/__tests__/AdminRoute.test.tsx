import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'u1', username: 'admin', displayName: '管理者', role: 'ADMIN', departmentId: '', isActive: true, createdAt: '', updatedAt: '' }, token: 't', isLoading: false }),
}));

import AdminRoute from '../AdminRoute';

describe('AdminRoute', () => {
  it('renders children for admin user', () => {
    render(
      <MemoryRouter>
        <AdminRoute>
          <div>secret</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
