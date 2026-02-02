import api from './api';
import type { Department, NotificationType, User, ApiResponse } from '../types';

export async function fetchDepartments(): Promise<Department[]> {
  const res = await api.get('master/departments').json<ApiResponse<Department[]>>();
  return res.data || [];
}

export async function createDepartment(payload: Partial<Department>) {
  const res = await api.post('master/departments', { json: payload }).json<ApiResponse<Department>>();
  return res.data;
}

export async function updateDepartment(id: string, payload: Partial<Department>) {
  const res = await api.put(`master/departments/${id}`, { json: payload }).json<ApiResponse<Department>>();
  return res.data;
}

export async function deleteDepartment(id: string) {
  const res = await api.delete(`master/departments/${id}`).json<ApiResponse<{ id: string }>>();
  return res.data;
}

export async function fetchNotificationTypes(): Promise<NotificationType[]> {
  const res = await api.get('master/notification-types').json<ApiResponse<NotificationType[]>>();
  return res.data || [];
}

export async function createNotificationType(payload: Partial<NotificationType>) {
  const res = await api.post('master/notification-types', { json: payload }).json<ApiResponse<NotificationType>>();
  return res.data;
}

export async function updateNotificationType(id: string, payload: Partial<NotificationType>) {
  const res = await api.put(`master/notification-types/${id}`, { json: payload }).json<ApiResponse<NotificationType>>();
  return res.data;
}

export async function deleteNotificationType(id: string) {
  const res = await api.delete(`master/notification-types/${id}`).json<ApiResponse<{ id: string }>>();
  return res.data;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await api.get('master/users').json<ApiResponse<User[]>>();
  return res.data || [];
}

export async function createUser(payload: Partial<User> & { password: string }) {
  const res = await api.post('master/users', { json: payload }).json<ApiResponse<User>>();
  return res.data;
}

export async function updateUser(id: string, payload: Partial<User> & { password?: string }) {
  const res = await api.put(`master/users/${id}`, { json: payload }).json<ApiResponse<User>>();
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await api.delete(`master/users/${id}`).json<ApiResponse<{ id: string }>>();
  return res.data;
}

export default null;
