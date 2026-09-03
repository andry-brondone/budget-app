import rateLimit from 'express-rate-limit';

/**
 * Limite les tentatives sur /login et /register pour se prémunir
 * du brute-force et du credential stuffing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives, réessayez plus tard' },
  },
});
