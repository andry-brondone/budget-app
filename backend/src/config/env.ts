import { z } from 'zod';

/**
 * Validation stricte des variables d'environnement au démarrage.
 * L'application refuse de démarrer si une variable requise est manquante
 * ou invalide — on préfère un crash immédiat et explicite à un bug
 * silencieux en production.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET doit contenir au moins 32 caractères'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET doit contenir au moins 32 caractères'),

  JWT_ACCESS_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(15),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),

  FRONTEND_URL: z.url().default('http://localhost:5173'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides:');
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
  throw new Error('Configuration invalide: vérifiez votre fichier .env');
}

export const env = parsed.data;
export type Env = typeof env;
