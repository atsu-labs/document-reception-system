import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireSenior } from '../middleware/permission';
import { successResponse } from '../utils/response';
import { getDB, Env } from '../db/client';
import { users } from '../db/schema';

const testRoutes = new Hono();

// Public route (no auth required)
testRoutes.get('/public', (c) => {
  return c.json(successResponse({ message: 'This is a public endpoint' }));
});

// Database test route
testRoutes.get('/db', async (c) => {
  try {
    const db = getDB(c.env as Env);
    const allUsers = await db.select().from(users);
    return c.json(successResponse({ 
      message: 'Database connection successful',
      userCount: allUsers.length,
      users: allUsers.map(u => ({ username: u.username, role: u.role }))
    }));
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Protected route (auth required)
testRoutes.get('/protected', authMiddleware, (c) => {
  return c.json(successResponse({ message: 'This is a protected endpoint' }));
});

// Senior-only route
testRoutes.get('/senior', authMiddleware, requireSenior, (c) => {
  return c.json(successResponse({ message: 'This endpoint requires SENIOR or ADMIN role' }));
});

// Admin-only route
testRoutes.get('/admin', authMiddleware, requireAdmin, (c) => {
  return c.json(successResponse({ message: 'This endpoint requires ADMIN role' }));
});

export default testRoutes;
