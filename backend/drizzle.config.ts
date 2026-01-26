import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/local.db',
  },
} satisfies Config;
