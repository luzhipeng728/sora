import express from 'express';
import { config } from './config';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRouter from './api/auth';
import videosRouter from './api/videos';
import { VideoJobModel } from './models/VideoJob';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url, headers } = req;

  // Log request
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📥 ${method} ${url}`);
  console.log(`   User-Agent: ${headers['user-agent']?.substring(0, 50)}...`);
  if (headers.authorization) {
    console.log(`   Auth: ${headers.authorization.substring(0, 20)}...`);
  }

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`📤 ${method} ${url} - ${res.statusCode} (${duration}ms)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    return originalSend.call(this, data);
  };

  next();
});

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/videos', videosRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Cleanup stuck jobs on startup
async function cleanupStuckJobs() {
  try {
    console.log('🧹 Cleaning up stuck jobs from previous runs...');
    const result = await VideoJobModel.cleanupStuckJobs();
    console.log(`✅ Cleaned up ${result.count} stuck jobs`);
  } catch (error) {
    console.error('❌ Failed to cleanup stuck jobs:', error);
  }
}

// Start server
const server = app.listen(config.port, async () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🎥 Sora API: ${config.soraApiUrl}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);

  // Cleanup stuck jobs
  await cleanupStuckJobs();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
