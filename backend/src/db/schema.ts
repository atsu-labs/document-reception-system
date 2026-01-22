import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role', { enum: ['GENERAL', 'SENIOR', 'ADMIN'] }).notNull(),
  departmentId: text('department_id').references(() => departments.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Departments table
export const departments = sqliteTable('departments', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  parentId: text('parent_id').references((): any => departments.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notification types table
export const notificationTypes = sqliteTable('notification_types', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  hasInspection: integer('has_inspection', { mode: 'boolean' }).notNull().default(false),
  hasContentField: integer('has_content_field', { mode: 'boolean' }).notNull().default(false),
  workflowTemplateId: text('workflow_template_id').references(() => workflowTemplates.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Workflow templates table
export const workflowTemplates = sqliteTable('workflow_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  statuses: text('statuses').notNull(), // JSON array of statuses
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  notificationTypeId: text('notification_type_id').notNull().references(() => notificationTypes.id),
  notificationDate: text('notification_date').notNull(),
  receivingDepartmentId: text('receiving_department_id').notNull().references(() => departments.id),
  processingDepartmentId: text('processing_department_id').notNull().references(() => departments.id),
  propertyName: text('property_name'),
  content: text('content'),
  inspectionDate: text('inspection_date'),
  inspectionDepartmentId: text('inspection_department_id').references(() => departments.id),
  completionDate: text('completion_date'),
  currentStatus: text('current_status').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text('updated_by').notNull().references(() => users.id),
});

// Notification history table
export const notificationHistory = sqliteTable('notification_history', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull().references(() => notifications.id),
  statusFrom: text('status_from'),
  statusTo: text('status_to').notNull(),
  changedBy: text('changed_by').notNull().references(() => users.id),
  comment: text('comment'),
  changedAt: text('changed_at').default(sql`CURRENT_TIMESTAMP`),
});
