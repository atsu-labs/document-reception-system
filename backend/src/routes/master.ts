import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDB, Env } from '../db/client';
import { departments, notificationTypes } from '../db/schema';
import { successResponse, errorResponse } from '../utils/response';
import { authMiddleware } from '../middleware/auth';

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

export default masterRouter;
