import { describe, it, expect } from 'vitest';
import { hasRole } from '../middleware/permission';

describe('Permission utilities', () => {
  it('should enforce role hierarchy correctly', () => {
    // ADMIN should be >= SENIOR and GENERAL
    expect(hasRole('ADMIN', 'SENIOR')).toBe(true);
    expect(hasRole('ADMIN', 'GENERAL')).toBe(true);

    // SENIOR should be >= GENERAL but not ADMIN
    expect(hasRole('SENIOR', 'GENERAL')).toBe(true);
    expect(hasRole('SENIOR', 'ADMIN')).toBe(false);

    // GENERAL only >= GENERAL
    expect(hasRole('GENERAL', 'GENERAL')).toBe(true);
    expect(hasRole('GENERAL', 'SENIOR')).toBe(false);
  });
});
