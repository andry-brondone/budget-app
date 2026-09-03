import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../config/logger.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} introuvable`));
};

/**
 * Middleware d'erreur centralisé : traduit chaque type d'erreur en
 * une réponse JSON cohérente `{ error: { code, message, details? } }`.
 * Doit être enregistré en dernier dans app.ts.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: z.treeifyError(err),
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err }, 'Erreur non gérée');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Une erreur inattendue est survenue' },
  });
};
