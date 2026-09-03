import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma-client.js';
import { env } from './env.js';

// Depuis Prisma 7, le moteur Rust a été retiré (moteur de requêtes
// TS+WASM) et un adapter de driver explicite est obligatoire — on ne
// peut plus se contenter d'une URL dans le schéma. Pour PostgreSQL,
// l'adapter officiel @prisma/adapter-pg s'appuie sur le driver `pg`.
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

// Pattern "singleton global" recommandé par Prisma pour éviter
// l'épuisement des connexions dû au hot-reload en développement.
export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
