import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { generateRefreshToken, hashToken, signAccessToken } from '../../utils/jwt.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface UserRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const toPublicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
});

/**
 * Émet un nouveau couple access/refresh token et persiste le refresh
 * token (hashé) en base afin de permettre sa révocation.
 */
const issueTokens = async (userId: string): Promise<AuthTokens> => {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateRefreshToken();
  const refreshTokenExpiresAt = new Date(
    Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  return { accessToken, refreshToken, refreshTokenExpiresAt };
};

export const registerUser = async (
  input: RegisterInput,
): Promise<{ user: PublicUser; tokens: AuthTokens }> => {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict('Cet email est déjà utilisé');
  }

  if (input.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing) throw ApiError.conflict('Ce numéro est déjà utilisé');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      passwordHash,
    },
  });

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens };
};

export const loginUser = async (
  input: LoginInput,
): Promise<{ user: PublicUser; tokens: AuthTokens }> => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: input.identifier }, { phone: input.identifier }] },
  });

  if (!user) throw ApiError.unauthorized('Identifiants incorrects');

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) throw ApiError.unauthorized('Identifiants incorrects');

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens };
};

/**
 * Rotation du refresh token : chaque utilisation invalide l'ancien
 * et en émet un nouveau. Cela limite l'impact d'un vol de token
 * (rejeu détectable) et suit les recommandations OWASP.
 */
export const refreshSession = async (
  refreshToken: string,
): Promise<{ user: PublicUser; tokens: AuthTokens }> => {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Session invalide, veuillez vous reconnecter');
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const tokens = await issueTokens(stored.userId);
  return { user: toPublicUser(stored.user), tokens };
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
};

export const getUserById = async (userId: string): Promise<PublicUser | null> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
};
