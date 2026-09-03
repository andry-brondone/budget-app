// Script de migration ponctuel : convertit les valeurs texte
// libres de l'ancien champ `Transaction.category` en véritables
// `Category` reliées par `categoryId`.
//
// Ce script doit être exécuté APRÈS avoir ajouté les modèles Category
// et Transaction.categoryId à ton schema.prisma de façon additive (sans
// encore supprimer l'ancien champ `category`), et AVANT de supprimer ce
// champ. Voir SETUP.md, section "Option B — conserver les données de test".
//
// Usage : pnpm tsx scripts/migrate-legacy-categories.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
// Import direct depuis le dossier généré (et non via
// src/config/prisma-client.js) : ce script cible délibérément l'état
// intermédiaire du schéma (voir l'avertissement ci-dessus), qui diffère
// du schéma final vers lequel pointe le module centralisé.
import { PrismaClient } from '../src/generated/prisma-client/client.js';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

const run = async (): Promise<void> => {
  const rows = await prisma.transaction.findMany({
    where: { category: { not: null }, categoryId: null },
    select: { id: true, userId: true, type: true, category: true },
  });

  console.log(`${String(rows.length)} transaction(s) à migrer.`);

  const cache = new Map<string, string>(); // clé "userId|nom|type" -> categoryId

  for (const row of rows) {
    const label = row.category?.trim();
    if (!label) continue;

    const cacheKey = `${row.userId}|${label.toLowerCase()}|${row.type}`;
    let categoryId = cache.get(cacheKey);

    if (!categoryId) {
      // Réutilise une catégorie par défaut existante au nom identique
      // plutôt que de créer un doublon personnel.
      const existing = await prisma.category.findFirst({
        where: {
          type: row.type,
          name: { equals: label, mode: 'insensitive' },
          OR: [{ userId: null }, { userId: row.userId }],
        },
      });

      if (existing) {
        categoryId = existing.id;
      } else {
        const created = await prisma.category.create({
          data: { userId: row.userId, name: label, type: row.type },
        });
        categoryId = created.id;
      }

      cache.set(cacheKey, categoryId);
    }

    await prisma.transaction.update({ where: { id: row.id }, data: { categoryId } });
  }

  console.log(`Migration terminée : ${String(rows.length)} transaction(s) traitée(s).`);
};

run()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
