// Permet de déclencher manuellement la reconduction des budgets sans
// attendre le 1er du mois — utile pour tester le comportement du job.
//
// Usage : pnpm tsx scripts/run-budget-rollover.ts

import 'dotenv/config';
import { rolloverBudgetsForCurrentMonth } from '../src/jobs/monthly-budget-rollover.job.js';
import { prisma } from '../src/config/db.js';

rolloverBudgetsForCurrentMonth()
  .then((count) => {
    console.log(`${String(count)} budget(s) créé(s) pour le mois en cours.`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
