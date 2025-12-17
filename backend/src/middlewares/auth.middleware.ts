import { ApiMiddleware } from 'motia';
import { extractTokenFromHeader, verifyToken } from '../services/auth';
import { UnauthorizedError } from '../errors/base.error';

// Extend request to include user info
declare module 'motia' {
  interface FlowContext {
    user?: {
      userId: string;
      email: string;
      name: string;
    };
  }
}

export const authMiddleware: ApiMiddleware = async (req, ctx, next) => {
  const authHeader = req.headers['authorization'] as string | undefined;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Attach user info to context
  (ctx as any).user = {
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  };

  return next();
};
