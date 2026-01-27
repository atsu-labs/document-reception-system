import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDB, Env } from '../db/client';
import { users } from '../db/schema';
import { generateToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { successResponse, errorResponse } from '../utils/response';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { getCurrentTimestamp } from '../utils/timestamp';

const auth = new Hono();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/**
 * POST /api/auth/login
 * User login - returns JWT token
 */
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');
  const db = getDB(c.env as Env);

  try {
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return c.json(
        errorResponse('INVALID_CREDENTIALS', 'Invalid username or password'),
        401
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return c.json(
        errorResponse('ACCOUNT_DISABLED', 'Account is disabled'),
        403
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json(
        errorResponse('INVALID_CREDENTIALS', 'Invalid username or password'),
        401
      );
    }

    // Generate JWT token
    const token = await generateToken(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      c.env
    );

    return c.json(
      successResponse({
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          departmentId: user.departmentId,
        },
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'An error occurred during login'),
      500
    );
  }
});

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
auth.post('/logout', authMiddleware, async (c) => {
  // In JWT-based auth, logout is handled client-side by removing the token
  // This endpoint confirms the logout action
  return c.json(
    successResponse({
      message: 'Logged out successfully',
    })
  );
});

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
auth.get('/me', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);

  try {
    // Fetch full user details from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.userId))
      .limit(1);

    if (!user) {
      return c.json(
        errorResponse('USER_NOT_FOUND', 'User not found'),
        404
      );
    }

    // Return only necessary fields
    const userData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      departmentId: user.departmentId,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return c.json(successResponse(userData));
  } catch (error) {
    console.error('Get user error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'An error occurred while fetching user data'),
      500
    );
  }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
auth.put('/password', authMiddleware, zValidator('json', passwordChangeSchema), async (c) => {
  const authUser = getAuthUser(c);
  const { currentPassword, newPassword } = c.req.valid('json');
  const db = getDB(c.env as Env);

  try {
    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.userId))
      .limit(1);

    if (!user) {
      return c.json(
        errorResponse('USER_NOT_FOUND', 'User not found'),
        404
      );
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return c.json(
        errorResponse('INVALID_PASSWORD', 'Current password is incorrect'),
        400
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: getCurrentTimestamp(),
      })
      .where(eq(users.id, authUser.userId));

    return c.json(
      successResponse({
        message: 'Password changed successfully',
      })
    );
  } catch (error) {
    console.error('Password change error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'An error occurred while changing password'),
      500
    );
  }
});

export default auth;
