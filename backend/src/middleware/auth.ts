import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserWithoutPassword } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No token provided',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate token and get user
    const user = await AuthService.getUserByToken(token);

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error: any) {
    res.status(401).json({
      error: error.message || 'Invalid token',
      code: 'UNAUTHORIZED',
    });
  }
};

/**
 * Optional auth middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await AuthService.getUserByToken(token);
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

export default authMiddleware;
