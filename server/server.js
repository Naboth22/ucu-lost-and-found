import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { testDatabaseConnection } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});
app.use('/api', apiLimiter);

app.use('/uploads', express.static(path.resolve(__dirname, env.uploadDir)));

app.get('/api/health', async (req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({
      success: true,
      service: 'UCU Campus Lost and Found API',
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'UCU Campus Lost and Found API',
      status: 'degraded',
      database: 'disconnected',
      message: error.message,
    });
  }
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: env.nodeEnv === 'production' && status === 500
      ? 'An unexpected server error occurred.'
      : err.message || 'Internal server error.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

export default app;
