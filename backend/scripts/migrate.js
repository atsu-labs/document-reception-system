#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'local.db');
const migrationsDir = join(__dirname, '..', 'drizzle', 'migrations');

console.log('🔄 Running migrations...');
console.log(`📁 Database path: ${dbPath}`);
console.log(`📁 Migrations directory: ${migrationsDir}`);

try {
  // Check if migrations directory exists
  if (!existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found. Please run `pnpm db:generate` first.');
    process.exit(1);
  }

  // Get all SQL migration files
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.error('❌ No migration files found. Please run `pnpm db:generate` first.');
    process.exit(1);
  }

  console.log(`📝 Found ${migrationFiles.length} migration(s)`);

  // Apply each migration
  for (const file of migrationFiles) {
    const migrationPath = join(migrationsDir, file);
    console.log(`  Applying: ${file}...`);
    execSync(`sqlite3 "${dbPath}" < "${migrationPath}"`, { stdio: 'inherit' });
  }

  console.log('✅ Migrations completed successfully!');
  console.log(`💾 Database created at: ${dbPath}`);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
