import { sign, verify } from 'hono/jwt';

// JWT configuration
// In Cloudflare Workers, env variables come from c.env
// In Node.js, they come from process.env
function getJWTSecret(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.JWT_SECRET || 'default-secret-change-in-production';
  }
  return 'default-secret-change-in-production';
}

const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION = 8 * 60 * 60; // 8 hours in seconds

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'GENERAL' | 'SENIOR' | 'ADMIN';
  exp?: number;
}

/**
 * Generate JWT token for user
 */
export async function generateToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;
  
  return await sign(
    {
      ...payload,
      exp,
    },
    getJWTSecret(),
    JWT_ALGORITHM
  );
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const payload = await verify(token, getJWTSecret(), JWT_ALGORITHM) as unknown;
    return payload as JWTPayload;
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
