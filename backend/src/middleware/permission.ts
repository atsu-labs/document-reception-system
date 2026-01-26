import { Context, Next } from 'hono';
import { getAuthUser } from './auth';
import { errorResponse } from '../utils/response';

type Role = 'GENERAL' | 'SENIOR' | 'ADMIN';

/**
 * Role hierarchy: ADMIN > SENIOR > GENERAL
 */
const roleHierarchy: Record<Role, number> = {
  GENERAL: 1,
  SENIOR: 2,
  ADMIN: 3,
};

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Permission middleware factory
 * Creates middleware that checks if user has minimum required role
 */
export function requireRole(minRole: Role) {
  return async (c: Context, next: Next) => {
    try {
      const user = getAuthUser(c);
      
      if (!hasRole(user.role, minRole)) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
      
      await next();
    } catch (error) {
      return c.json(errorResponse('UNAUTHORIZED', 'Authentication required'), 401);
    }
  };
}

/**
 * Middleware to require SENIOR role or higher
 */
export const requireSenior = requireRole('SENIOR');

/**
 * Middleware to require ADMIN role
 */
export const requireAdmin = requireRole('ADMIN');
