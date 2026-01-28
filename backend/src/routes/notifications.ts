import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, or, like, gte, lte, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getDB, Env } from '../db/client';
import { notifications, notificationHistory, users } from '../db/schema';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { requireSenior, requireAdmin } from '../middleware/permission';
import { getCurrentTimestamp } from '../utils/timestamp';
import {
  createNotificationSchema,
  updateNotificationSchema,
  updateStatusSchema,
  listNotificationsQuerySchema,
} from '../utils/validation';

const notificationsRouter = new Hono();

// Apply auth middleware to all notification routes
notificationsRouter.use('*', authMiddleware);

/**
 * GET /api/notifications
 * List notifications with pagination and filters
 * Access: All authenticated users (filtered by role)
 */
notificationsRouter.get('/', zValidator('query', listNotificationsQuerySchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const query = c.req.valid('query');

  try {
    // Build where conditions
    const conditions = [];

    // Role-based filtering
    if (authUser.role === 'GENERAL') {
      // GENERAL users can only see notifications from their department
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);
      
      if (user?.departmentId) {
        conditions.push(
          or(
            eq(notifications.receivingDepartmentId, user.departmentId),
            eq(notifications.processingDepartmentId, user.departmentId)
          )
        );
      }
    }
    // SENIOR and ADMIN can see all notifications (no additional filtering)

    // Status filter
    if (query.status) {
      conditions.push(eq(notifications.currentStatus, query.status));
    }

    // Department filter
    if (query.departmentId) {
      conditions.push(
        or(
          eq(notifications.receivingDepartmentId, query.departmentId),
          eq(notifications.processingDepartmentId, query.departmentId)
        )
      );
    }

    // Date range filters
    if (query.fromDate) {
      conditions.push(gte(notifications.notificationDate, query.fromDate));
    }
    if (query.toDate) {
      conditions.push(lte(notifications.notificationDate, query.toDate));
    }

    // Keyword search (property name or content)
    if (query.keyword) {
      conditions.push(
        or(
          like(notifications.propertyName, `%${query.keyword}%`),
          like(notifications.content, `%${query.keyword}%`)
        )
      );
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all matching records first to count them (simple approach)
    const allItems = await db
      .select()
      .from(notifications)
      .where(whereClause);
    
    const total = allItems.length;

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const items = allItems
      .sort((a, b) => {
        // Sort by notification date desc, then created at desc
        if (b.notificationDate !== a.notificationDate) {
          return b.notificationDate.localeCompare(a.notificationDate);
        }
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      })
      .slice(offset, offset + query.limit);

    return c.json(paginatedResponse(items, query.page, query.limit, total));
  } catch (error) {
    console.error('List notifications error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch notifications'),
      500
    );
  }
});

/**
 * GET /api/notifications/:id
 * Get notification details
 * Access: All authenticated users (with department check for GENERAL)
 */
notificationsRouter.get('/:id', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!notification) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // Check access permissions
    if (authUser.role === 'GENERAL') {
      // GENERAL users can only access notifications from their department
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== notification.receivingDepartmentId &&
        user.departmentId !== notification.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    return c.json(successResponse(notification));
  } catch (error) {
    console.error('Get notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch notification'),
      500
    );
  }
});

/**
 * POST /api/notifications
 * Create new notification
 * Access: All authenticated users
 */
notificationsRouter.post('/', zValidator('json', createNotificationSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const data = c.req.valid('json');

  try {
    // Check if user has access to the receiving department
    if (authUser.role === 'GENERAL') {
      // GENERAL users can only create notifications for their department
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== data.receivingDepartmentId &&
        user.departmentId !== data.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Cannot create notification for other departments'),
          403
        );
      }
    }

    // Create notification
    const id = randomUUID();
    const now = getCurrentTimestamp();

    await db.insert(notifications).values({
      id,
      ...data,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial history entry
    await db.insert(notificationHistory).values({
      id: randomUUID(),
      notificationId: id,
      statusFrom: null,
      statusTo: data.currentStatus,
      changedBy: authUser.userId,
      comment: '届出を作成しました',
      changedAt: now,
    });

    // Fetch the created notification
    const [created] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(created), 201);
  } catch (error) {
    console.error('Create notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to create notification'),
      500
    );
  }
});

/**
 * PUT /api/notifications/:id
 * Update notification
 * Access: SENIOR and ADMIN (full access), GENERAL (own department only)
 */
notificationsRouter.put('/:id', zValidator('json', updateNotificationSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');
  const data = c.req.valid('json');

  try {
    // Get existing notification
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // Check access permissions
    if (authUser.role === 'GENERAL') {
      // GENERAL users can only update notifications from their department
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== existing.receivingDepartmentId &&
        user.departmentId !== existing.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    // Update notification
    const now = getCurrentTimestamp();
    await db
      .update(notifications)
      .set({
        ...data,
        updatedBy: authUser.userId,
        updatedAt: now,
      })
      .where(eq(notifications.id, id));

    // Fetch updated notification
    const [updated] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(updated));
  } catch (error) {
    console.error('Update notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to update notification'),
      500
    );
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification (soft delete - not implemented as schema doesn't have deleted flag)
 * Access: ADMIN only
 */
notificationsRouter.delete('/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    // Check if notification exists
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // Hard delete (as schema doesn't have soft delete flag)
    // Delete history first (foreign key constraint)
    await db
      .delete(notificationHistory)
      .where(eq(notificationHistory.notificationId, id));

    // Delete notification
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));

    return c.json(
      successResponse({ message: 'Notification deleted successfully' })
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to delete notification'),
      500
    );
  }
});

/**
 * PUT /api/notifications/:id/status
 * Update notification status
 * Access: SENIOR and ADMIN
 */
notificationsRouter.put('/:id/status', requireSenior, zValidator('json', updateStatusSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');
  const { status, comment } = c.req.valid('json');

  try {
    // Get existing notification
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    const oldStatus = existing.currentStatus;

    // Update status
    const now = getCurrentTimestamp();
    await db
      .update(notifications)
      .set({
        currentStatus: status,
        updatedBy: authUser.userId,
        updatedAt: now,
      })
      .where(eq(notifications.id, id));

    // Create history entry
    await db.insert(notificationHistory).values({
      id: randomUUID(),
      notificationId: id,
      statusFrom: oldStatus,
      statusTo: status,
      changedBy: authUser.userId,
      comment: comment || null,
      changedAt: now,
    });

    // Fetch updated notification
    const [updated] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(updated));
  } catch (error) {
    console.error('Update status error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to update status'),
      500
    );
  }
});

/**
 * GET /api/notifications/:id/history
 * Get notification history
 * Access: All authenticated users (with department check for GENERAL)
 */
notificationsRouter.get('/:id/history', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    // Check if notification exists and user has access
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!notification) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // Check access permissions
    if (authUser.role === 'GENERAL') {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== notification.receivingDepartmentId &&
        user.departmentId !== notification.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    // Fetch history
    const history = await db
      .select()
      .from(notificationHistory)
      .where(eq(notificationHistory.notificationId, id))
      .orderBy(desc(notificationHistory.changedAt));

    return c.json(successResponse(history));
  } catch (error) {
    console.error('Get history error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch history'),
      500
    );
  }
});

export default notificationsRouter;
