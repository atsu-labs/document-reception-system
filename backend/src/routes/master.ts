import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDB, Env } from '../db/client';
import { departments, notificationTypes, users } from '../db/schema';
import { successResponse, errorResponse } from '../utils/response';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/permission';
import { zValidator } from '@hono/zod-validator';
import { createDepartmentSchema, createNotificationTypeSchema, createUserSchema } from '../utils/validation';
import { randomUUID } from 'crypto';
import { hashPassword } from '../utils/password';
import { getCurrentTimestamp } from '../utils/timestamp';

const masterRouter = new Hono();

// Apply authentication middleware to all master routes
masterRouter.use('*', authMiddleware);

/**
 * GET /api/master/departments
 * Get all active departments
 * Access: All authenticated users
 */
masterRouter.get('/departments', async (c) => {
  const db = getDB(c.env as Env);

  try {
    const allDepartments = await db
      .select()
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(departments.sortOrder);

    return c.json(successResponse(allDepartments));
  } catch (error) {
    console.error('Get departments error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch departments'),
      500
    );
  }
});

/**
 * GET /api/master/notification-types
 * Get all active notification types
 * Access: All authenticated users
 */
masterRouter.get('/notification-types', async (c) => {
  const db = getDB(c.env as Env);

  try {
    const allTypes = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.isActive, true))
      .orderBy(notificationTypes.sortOrder);

    return c.json(successResponse(allTypes));
  } catch (error) {
    console.error('Get notification types error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch notification types'),
      500
    );
  }
});

/**
 * CRUD for Departments (admin only for write operations)
 */
masterRouter.post(
  '/departments',
  requireAdmin,
  zValidator('json', createDepartmentSchema),
  async (c) => {
    const db = getDB(c.env as Env);
    const data = c.req.valid('json');

    try {
      const id = randomUUID();
      const now = getCurrentTimestamp();

      await db.insert(departments).values({
        id,
        code: data.code,
        name: data.name,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      });

      const [created] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);

      return c.json(successResponse(created), 201);
    } catch (error) {
      console.error('Create department error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create department'), 500);
    }
  }
);

masterRouter.get('/departments/:id', async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [item] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
    if (!item) {
      return c.json(errorResponse('NOT_FOUND', 'Department not found'), 404);
    }
    return c.json(successResponse(item));
  } catch (error) {
    console.error('Get department error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch department'), 500);
  }
});

masterRouter.put(
  '/departments/:id',
  requireAdmin,
  zValidator('json', createDepartmentSchema),
  async (c) => {
    const db = getDB(c.env as Env);
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const now = getCurrentTimestamp();
      await db
        .update(departments)
        .set({
          code: data.code,
          name: data.name,
          parentId: data.parentId ?? null,
          sortOrder: data.sortOrder ?? 0,
          updatedAt: now,
        })
        .where(eq(departments.id, id));

      const [updated] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
      return c.json(successResponse(updated));
    } catch (error) {
      console.error('Update department error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update department'), 500);
    }
  }
);

masterRouter.delete('/departments/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const now = getCurrentTimestamp();
    await db.update(departments).set({ isActive: false, updatedAt: now }).where(eq(departments.id, id));
    return c.json(successResponse({ id }));
  } catch (error) {
    console.error('Delete department error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to delete department'), 500);
  }
});

/**
 * CRUD for Notification Types (admin only for write operations)
 */
masterRouter.post(
  '/notification-types',
  requireAdmin,
  zValidator('json', createNotificationTypeSchema),
  async (c) => {
    const db = getDB(c.env as Env);
    const data = c.req.valid('json');

    try {
      const id = randomUUID();
      const now = getCurrentTimestamp();

      await db.insert(notificationTypes).values({
        id,
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        parentGroupId: data.parentGroupId ?? null,
        hasInspection: !!data.hasInspection,
        hasContentField: !!data.hasContentField,
        requiresAdditionalData: !!data.requiresAdditionalData,
        workflowTemplateId: data.workflowTemplateId ?? null,
        sortOrder: data.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      });

      const [created] = await db.select().from(notificationTypes).where(eq(notificationTypes.id, id)).limit(1);
      return c.json(successResponse(created), 201);
    } catch (error) {
      console.error('Create notification type error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create notification type'), 500);
    }
  }
);

masterRouter.get('/notification-types/:id', async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [item] = await db.select().from(notificationTypes).where(eq(notificationTypes.id, id)).limit(1);
    if (!item) {
      return c.json(errorResponse('NOT_FOUND', 'Notification type not found'), 404);
    }
    return c.json(successResponse(item));
  } catch (error) {
    console.error('Get notification type error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch notification type'), 500);
  }
});

masterRouter.put(
  '/notification-types/:id',
  requireAdmin,
  zValidator('json', createNotificationTypeSchema),
  async (c) => {
    const db = getDB(c.env as Env);
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const now = getCurrentTimestamp();
      await db
        .update(notificationTypes)
        .set({
          code: data.code,
          name: data.name,
          description: data.description ?? null,
          parentGroupId: data.parentGroupId ?? null,
          hasInspection: !!data.hasInspection,
          hasContentField: !!data.hasContentField,
          requiresAdditionalData: !!data.requiresAdditionalData,
          workflowTemplateId: data.workflowTemplateId ?? null,
          sortOrder: data.sortOrder ?? 0,
          updatedAt: now,
        })
        .where(eq(notificationTypes.id, id));

      const [updated] = await db.select().from(notificationTypes).where(eq(notificationTypes.id, id)).limit(1);
      return c.json(successResponse(updated));
    } catch (error) {
      console.error('Update notification type error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update notification type'), 500);
    }
  }
);

masterRouter.delete('/notification-types/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const now = getCurrentTimestamp();
    await db.update(notificationTypes).set({ isActive: false, updatedAt: now }).where(eq(notificationTypes.id, id));
    return c.json(successResponse({ id }));
  } catch (error) {
    console.error('Delete notification type error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to delete notification type'), 500);
  }
});

/**
 * User management (admin only)
 */
masterRouter.get('/users', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);

  try {
    const allUsers = await db.select().from(users);
    return c.json(successResponse(allUsers));
  } catch (error) {
    console.error('List users error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch users'), 500);
  }
});

masterRouter.get('/users/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      return c.json(errorResponse('NOT_FOUND', 'User not found'), 404);
    }
    return c.json(successResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch user'), 500);
  }
});

masterRouter.post('/users', requireAdmin, zValidator('json', createUserSchema), async (c) => {
  const db = getDB(c.env as Env);
  const data = c.req.valid('json');

  try {
    const id = randomUUID();
    const now = getCurrentTimestamp();
    const passwordHash = await hashPassword(data.password);

    await db.insert(users).values({
      id,
      username: data.username,
      passwordHash,
      displayName: data.displayName,
      role: data.role,
      departmentId: data.departmentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return c.json(successResponse(created), 201);
  } catch (error) {
    console.error('Create user error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create user'), 500);
  }
});

masterRouter.put('/users/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = {};
    if (body.displayName) updates.displayName = body.displayName;
    if (body.role) updates.role = body.role;
    if (body.departmentId) updates.departmentId = body.departmentId;
    if (typeof body.isActive !== 'undefined') updates.isActive = !!body.isActive;
    if (body.password) updates.passwordHash = await hashPassword(body.password);
    updates.updatedAt = getCurrentTimestamp();

    await db.update(users).set(updates).where(eq(users.id, id));

    const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return c.json(successResponse(updated));
  } catch (error) {
    console.error('Update user error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update user'), 500);
  }
});

masterRouter.delete('/users/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    await db.update(users).set({ isActive: false, updatedAt: getCurrentTimestamp() }).where(eq(users.id, id));
    return c.json(successResponse({ id }));
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to delete user'), 500);
  }
});

export default masterRouter;
