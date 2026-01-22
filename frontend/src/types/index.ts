// Common types

export type UserRole = 'GENERAL' | 'SENIOR' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  hasInspection: boolean;
  hasContentField: boolean;
  workflowTemplateId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  notificationTypeId: string;
  notificationDate: string;
  receivingDepartmentId: string;
  processingDepartmentId: string;
  propertyName?: string | null;
  content?: string | null;
  inspectionDate?: string | null;
  inspectionDepartmentId?: string | null;
  completionDate?: string | null;
  currentStatus: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
