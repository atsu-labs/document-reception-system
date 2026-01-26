import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './routes/auth';
import testRoutes from './routes/test';

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

// API routes
app.get('/api', (c) => {
  return c.json({ message: 'Document Reception System API' });
});

// Auth routes
app.route('/api/auth', auth);

// Test routes (for development/testing)
app.route('/api/test', testRoutes);

export default app;
