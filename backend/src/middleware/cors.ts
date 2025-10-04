import cors from 'cors';
import { config } from '../config';

/**
 * CORS configuration
 * Allows requests from frontend origin with credentials
 */
export const corsMiddleware = cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
});

export default corsMiddleware;
