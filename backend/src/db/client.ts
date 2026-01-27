// Database client configuration
// **D1-FIRST IMPLEMENTATION POLICY**
// This project prioritizes Cloudflare D1 as the primary database.
// The current SQLite fallback is for local development only.
//
// FUTURE EXPANSION POINT:
// When Docker/SQLite deployment support is needed, this layer should be extended to:
// 1. Add a database adapter interface/abstraction layer
// 2. Implement separate adapters for D1 and SQLite with unified API
// 3. Add environment-based strategy pattern for database selection
// 4. Consider using drizzle-orm/d1 for D1-specific operations
//
// For now, we maintain a simple implementation that works with D1 in production
// (Cloudflare Workers) and SQLite for local development convenience.

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Environment type definition
export interface Env {
  DB?: any; // D1 database binding for Cloudflare Workers (PRIMARY)
  JWT_SECRET?: string;
  DATABASE_PATH?: string; // Used only for local development fallback
}

let localDB: ReturnType<typeof drizzle> | null = null;

/**
 * Get database instance
 * 
 * PRIORITY: Cloudflare D1 (production)
 * FALLBACK: SQLite (local development only)
 * 
 * FUTURE EXTENSION POINT:
 * This function is the central point for database access.
 * When adding Docker/SQLite deployment support, consider:
 * - Adding a DB_TYPE environment variable to explicitly select database type
 * - Implementing a factory pattern with separate D1Client and SQLiteClient
 * - Creating a common DBInterface that both clients implement
 * - Handling migration differences between D1 and SQLite dialects
 */
export function getDB(env?: Env) {
  // PRIMARY: In Cloudflare Workers, D1 database is available via env.DB
  // This is the preferred production deployment method
  if (env?.DB) {
    return env.DB;
  }
  
  // FALLBACK: For local development with SQLite only
  // This is NOT intended for production Docker/SQLite deployment
  if (!localDB) {
    const dbPath = 
      (typeof process !== 'undefined' && process.env?.DATABASE_PATH) || 
      './data/local.db';
    const sqlite = new Database(dbPath);
    localDB = drizzle(sqlite, { schema });
  }
  
  return localDB;
}
