import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../lib/masterApi', () => ({
  fetchDepartments: vi.fn().mockResolvedValue([
    { id: 'd1', code: 'DEPT001', name: '総務部', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  ]),
  createDepartment: vi.fn().mockResolvedValue({}),
  updateDepartment: vi.fn().mockResolvedValue({}),
  deleteDepartment: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'u1', username: 'admin', displayName: '管理者', role: 'ADMIN', departmentId: '', isActive: true, createdAt: '', updatedAt: '' }, token: 't', isLoading: false }),
}));

import Departments from '../Departments';

describe('Departments admin page', () => {
  it('renders department list', async () => {
    render(<Departments />);

    await waitFor(() => expect(screen.getByText('所属管理')).toBeInTheDocument());
    expect(screen.getByText('総務部')).toBeInTheDocument();
  });
});
