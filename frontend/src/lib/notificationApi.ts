import { api } from './api';
import type { 
  Notification, 
  NotificationHistory, 
  Department, 
  NotificationType,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';
import type { 
  NotificationCreateInput, 
  NotificationUpdateInput, 
  StatusChangeInput, 
  NotificationFilterInput 
} from './validations/notification';

// Notifications API
export const notificationsApi = {
  // List notifications with filters
  async list(filters?: NotificationFilterInput): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.keyword) params.append('keyword', filters.keyword);
    
    const response = await api.get(`notifications?${params.toString()}`).json<ApiResponse<PaginatedResponse<Notification>>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch notifications');
    }
    
    return response.data;
  },

  // Get notification by ID
  async getById(id: string): Promise<Notification> {
    const response = await api.get(`notifications/${id}`).json<ApiResponse<Notification>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch notification');
    }
    
    return response.data;
  },

  // Create notification
  async create(data: NotificationCreateInput): Promise<Notification> {
    const response = await api.post('notifications', { json: data }).json<ApiResponse<Notification>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create notification');
    }
    
    return response.data;
  },

  // Update notification
  async update(id: string, data: NotificationUpdateInput): Promise<Notification> {
    const response = await api.put(`notifications/${id}`, { json: data }).json<ApiResponse<Notification>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update notification');
    }
    
    return response.data;
  },

  // Change status
  async changeStatus(id: string, data: StatusChangeInput): Promise<Notification> {
    const response = await api.put(`notifications/${id}/status`, { json: data }).json<ApiResponse<Notification>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to change status');
    }
    
    return response.data;
  },

  // Get history
  async getHistory(id: string): Promise<NotificationHistory[]> {
    const response = await api.get(`notifications/${id}/history`).json<ApiResponse<NotificationHistory[]>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch history');
    }
    
    return response.data;
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    const response = await api.delete(`notifications/${id}`).json<ApiResponse<{ message: string }>>();
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification');
    }
  },
};

// Master data API
export const masterApi = {
  // Departments
  async getDepartments(): Promise<Department[]> {
    const response = await api.get('master/departments').json<ApiResponse<Department[]>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch departments');
    }
    
    return response.data;
  },

  // Notification types
  async getNotificationTypes(): Promise<NotificationType[]> {
    const response = await api.get('master/notification-types').json<ApiResponse<NotificationType[]>>();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch notification types');
    }
    
    return response.data;
  },
};
