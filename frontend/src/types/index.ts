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

export interface NotificationGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
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
  groupId: string; // 届出グループID（必須）
  hasInspection: boolean;
  hasCertificateIssue: boolean; // 証明書発行の有無
  hasContentField: boolean;
  requiresAdditionalData: boolean;
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
  additionalData?: string | null;
  certificateIssueDepartmentId?: string | null; // 証明書発行所属
  certificateIssueDate?: string | null; // 証明書発行日付
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

export interface NotificationHistory {
  id: string;
  notificationId: string;
  statusFrom: string | null;
  statusTo: string;
  changedBy: string;
  comment?: string | null;
  changedAt: string;
}

export interface Inspection {
  id: string;
  notificationId: string;
  inspectionDate: string;
  inspectionDepartmentId: string;
  inspectionType?: string | null;
  status: string;
  result?: string | null;
  notes?: string | null;
  inspectedBy?: string | null;
  inspectedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}
