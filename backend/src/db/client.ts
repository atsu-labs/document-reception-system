// Database client configuration
// This file will handle both Cloudflare D1 (production) and SQLite (development)

export function getDB(env: any) {
  // In Cloudflare Workers, D1 database is available via env.DB
  // For local development, we use SQLite
  if (env?.DB) {
    return env.DB;
  }
  
  // For local development, you would set up a better-sqlite3 connection
  // This is a placeholder for now
  throw new Error('Database connection not configured');
}
