// Depuis Prisma 7, la connexion à la base de données et les options du
// CLI (migrations, seed) sont configurées ici plutôt que dans
// schema.prisma. Ce fichier est lu par la CLI Prisma (`prisma generate`,
// `prisma migrate dev`, etc.), pas par l'application elle-même — le
// runtime applicatif se connecte via l'adapter configuré dans
// src/config/db.ts.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Permet `prisma db seed` en plus de l'appel direct `tsx prisma/seed.ts`.
    // Rappel : depuis Prisma 7, ceci ne se déclenche plus automatiquement
    // après `migrate dev`/`migrate reset` — toujours explicite.
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
