import { serve } from '@hono/node-server';
import app from './index';

const port = process.env.PORT ? parseInt(process.env.PORT) : 8787;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
