// Database client configuration
// This project uses Cloudflare D1 as the database for both development and production.

import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

// Environment type definition
export interface Env {
  DB: any; // D1 database binding for Cloudflare Workers
  JWT_SECRET?: string;
}

/**
 * Get database instance
 * 
 * Returns a Drizzle ORM instance configured for Cloudflare D1.
 * For local development, use `wrangler dev` which provides a local D1 instance.
 */
export function getDB(env: Env) {
  if (!env?.DB) {
    throw new Error('D1 database binding not found. Make sure to run with wrangler or configure D1 binding.');
  }
  return drizzleD1(env.DB, { schema });
}
