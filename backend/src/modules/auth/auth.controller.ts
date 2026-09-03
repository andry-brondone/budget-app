import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { ApiError } from '../../utils/api-error.js';
import { getCookie } from '../../utils/cookies.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import {
  getUserById,
  loginUser,
  refreshSession,
  registerUser,
  revokeRefreshToken,
} from './auth.service.js';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

const REFRESH_COOKIE_NAME = 'refresh_token';

// Le cookie n'est envoyé que sur /api/auth/* : réduit la surface
// d'exposition du refresh token en cas de faille sur une autre route.
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/api/auth',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const { user, tokens } = await registerUser(input);

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...refreshCookieOptions,
    expires: tokens.refreshTokenExpiresAt,
  });
  res.status(201).json({ user, accessToken: tokens.accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, tokens } = await loginUser(input);

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...refreshCookieOptions,
    expires: tokens.refreshTokenExpiresAt,
  });
  res.status(200).json({ user, accessToken: tokens.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);

  if (!refreshToken) throw ApiError.unauthorized('Aucune session active');

  const { user, tokens } = await refreshSession(refreshToken);

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...refreshCookieOptions,
    expires: tokens.refreshTokenExpiresAt,
  });
  res.status(200).json({ user, accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const user = await getUserById(userId);
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  res.status(200).json({ user });
});
