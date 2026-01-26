import { Context, Next } from 'hono';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

// Extend Hono context to include user information
export interface AuthContext {
  user: JWTPayload;
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header'), 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const payload = await verifyToken(token);
    
    // Attach user info to context
    c.set('user', payload);
    
    await next();
  } catch (error) {
    return c.json(errorResponse('UNAUTHORIZED', 'Invalid or expired token'), 401);
  }
}

/**
 * Get authenticated user from context
 */
export function getAuthUser(c: Context): JWTPayload {
  const user = c.get('user');
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user as JWTPayload;
}
