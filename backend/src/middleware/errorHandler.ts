import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.url,
  });
};

/**
 * Async route handler wrapper
 * Catches errors from async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
