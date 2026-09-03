import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
}

/**
 * Access token JWT : courte durée de vie, transmis dans le header
 * Authorization et stocké uniquement en mémoire côté client (jamais
 * en localStorage) pour limiter le risque de vol via XSS.
 */
export const signAccessToken = (userId: string): string =>
  jwt.sign({ sub: userId } satisfies AccessTokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN_MINUTES * 60,
  });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

/**
 * Refresh token opaque (pas un JWT) : généré aléatoirement, stocké
 * hashé en base (jamais en clair), transmis via cookie httpOnly.
 * Cela permet la révocation immédiate (déconnexion, vol détecté).
 */
export const generateRefreshToken = (): string => crypto.randomBytes(64).toString('hex');

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
