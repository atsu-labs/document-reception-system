import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../utils/jwt';

describe('JWT utilities', () => {
  it('should generate and verify token payloads', async () => {
    const payload = { userId: 'u1', username: 'admin', role: 'ADMIN' as const };
    // use a deterministic secret for test
    process.env.JWT_SECRET = 'test-secret-123';

    const token = await generateToken(payload, { JWT_SECRET: 'test-secret-123' });
    expect(typeof token).toBe('string');

    const verified = await verifyToken(token, { JWT_SECRET: 'test-secret-123' });
    expect(verified.userId).toBe(payload.userId);
    expect(verified.username).toBe(payload.username);
    expect(verified.role).toBe(payload.role);
  });
});
