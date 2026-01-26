// Database client configuration
// This file will handle both Cloudflare D1 (production) and SQLite (development)

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Environment type definition
export interface Env {
  DB?: any; // D1 database binding for Cloudflare Workers
  JWT_SECRET?: string;
  DATABASE_PATH?: string;
}

let localDB: ReturnType<typeof drizzle> | null = null;

export function getDB(env?: Env) {
  // In Cloudflare Workers, D1 database is available via env.DB
  if (env?.DB) {
    return env.DB;
  }
  
  // For local development with SQLite
  if (!localDB) {
    const dbPath = 
      (typeof process !== 'undefined' && process.env?.DATABASE_PATH) || 
      './data/local.db';
    const sqlite = new Database(dbPath);
    localDB = drizzle(sqlite, { schema });
  }
  
  return localDB;
}
