import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('World');
  });

  it('should work with objects', () => {
    const user = { name: 'Test User', role: 'admin' };
    expect(user).toHaveProperty('name');
    expect(user.role).toBe('admin');
  });
});
