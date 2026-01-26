import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireSenior } from '../middleware/permission';
import { successResponse } from '../utils/response';

const testRoutes = new Hono();

// Public route (no auth required)
testRoutes.get('/public', (c) => {
  return c.json(successResponse({ message: 'This is a public endpoint' }));
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
