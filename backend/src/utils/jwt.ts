import { sign, verify } from 'hono/jwt';

// JWT configuration
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION = 8 * 60 * 60; // 8 hours in seconds

// Get JWT secret from environment (supports both Node.js and Cloudflare Workers)
function getJWTSecret(env?: any): string {
  // For Cloudflare Workers, env.JWT_SECRET
  if (env?.JWT_SECRET) {
    return env.JWT_SECRET;
  }
  // For Node.js, process.env.JWT_SECRET
  if (typeof process !== 'undefined' && process.env?.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  return 'default-secret-change-in-production';
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'GENERAL' | 'SENIOR' | 'ADMIN';
  exp?: number;
}

/**
 * Generate JWT token for user
 */
export async function generateToken(
  payload: Omit<JWTPayload, 'exp'>,
  env?: any
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;
  
  return await sign(
    {
      ...payload,
      exp,
    },
    getJWTSecret(env),
    JWT_ALGORITHM
  );
}

/**
 * Verify JWT token and return typed payload
 */
export async function verifyToken(token: string, env?: any): Promise<JWTPayload> {
  try {
    const payload = await verify(token, getJWTSecret(env), JWT_ALGORITHM);
    
    // Validate payload structure
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'userId' in payload &&
      'username' in payload &&
      'role' in payload
    ) {
      return {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as 'GENERAL' | 'SENIOR' | 'ADMIN',
        exp: payload.exp as number | undefined,
      };
    }
    
    throw new Error('Invalid token payload structure');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}
