import { z } from 'zod';

// Notification creation schema
export const notificationCreateSchema = z.object({
  notificationTypeId: z.string().min(1, '届出種類を選択してください'),
  notificationDate: z.string().min(1, '届出日を入力してください'),
  receivingDepartmentId: z.string().min(1, '受付所属を選択してください'),
  processingDepartmentId: z.string().min(1, '処理所属を選択してください'),
  propertyName: z.string().optional(),
  content: z.string().optional(),
  inspectionDate: z.string().optional(),
  inspectionDepartmentId: z.string().optional(),
  completionDate: z.string().optional(),
  currentStatus: z.string().min(1, 'ステータスを入力してください'),
});

export type NotificationCreateInput = z.infer<typeof notificationCreateSchema>;

// Notification update schema
export const notificationUpdateSchema = z.object({
  notificationTypeId: z.string().optional(),
  notificationDate: z.string().optional(),
  receivingDepartmentId: z.string().optional(),
  processingDepartmentId: z.string().optional(),
  propertyName: z.string().optional(),
  content: z.string().optional(),
  inspectionDate: z.string().optional(),
  inspectionDepartmentId: z.string().optional(),
  completionDate: z.string().optional(),
  currentStatus: z.string().optional(),
});

export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;

// Status change schema
export const statusChangeSchema = z.object({
  status: z.string().min(1, 'ステータスを入力してください'),
  comment: z.string().optional(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;

// Notification filter schema
export const notificationFilterSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.string().optional(),
  departmentId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  keyword: z.string().optional(),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
