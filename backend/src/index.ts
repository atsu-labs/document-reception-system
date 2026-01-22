import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Backend is running' });
});

// API routes will be added here
app.get('/api', (c) => {
  return c.json({ message: 'Document Reception System API' });
});

export default app;
