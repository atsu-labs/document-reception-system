import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// User validation schemas
export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  role: z.enum(['GENERAL', 'SENIOR', 'ADMIN']),
  departmentId: z.string().uuid(),
});

// Department validation schemas
export const createDepartmentSchema = z.object({
  code: z.string().min(1, 'Department code is required'),
  name: z.string().min(1, 'Department name is required'),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

// Notification type validation schemas
export const createNotificationTypeSchema = z.object({
  code: z.string().min(1, 'Notification type code is required'),
  name: z.string().min(1, 'Notification type name is required'),
  description: z.string().optional().nullable(),
  hasInspection: z.boolean().default(false),
  hasContentField: z.boolean().default(false),
  workflowTemplateId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  notificationTypeId: z.string().uuid(),
  notificationDate: z.string(), // ISO date string
  receivingDepartmentId: z.string().uuid(),
  processingDepartmentId: z.string().uuid(),
  propertyName: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  inspectionDate: z.string().optional().nullable(),
  inspectionDepartmentId: z.string().uuid().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  currentStatus: z.string(),
});

export const updateNotificationSchema = z.object({
  notificationTypeId: z.string().uuid().optional(),
  notificationDate: z.string().optional(),
  receivingDepartmentId: z.string().uuid().optional(),
  processingDepartmentId: z.string().uuid().optional(),
  propertyName: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  inspectionDate: z.string().optional().nullable(),
  inspectionDepartmentId: z.string().uuid().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  currentStatus: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  comment: z.string().optional().nullable(),
});

export const listNotificationsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  status: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  keyword: z.string().optional(),
});
