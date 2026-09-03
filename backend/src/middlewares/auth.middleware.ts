import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Vérifie le JWT d'accès dans le header `Authorization: Bearer <token>`
 * et attache `userId` à la requête. À utiliser sur toute route protégée.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized());
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).userId = payload.sub;
    next();
  } catch {
    next(ApiError.unauthorized('Session expirée, veuillez vous reconnecter'));
  }
};
