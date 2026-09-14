// Permet de déclencher manuellement la reconduction des budgets sans
// attendre le 1er du mois — utile pour tester le comportement du job.
//
// Usage : pnpm tsx scripts/run-budget-rollover.ts

import 'dotenv/config';
import {
  rolloverBudgetsForCurrentMonth,
  rolloverOverallBudgetForCurrentMonth,
} from '../src/jobs/monthly-budget-rollover.job.js';
import { prisma } from '../src/config/db.js';

Promise.all([rolloverBudgetsForCurrentMonth(), rolloverOverallBudgetForCurrentMonth()])
  .then(([categoryCount, overallCount]) => {
    console.log(`${String(categoryCount)} budget(s) par catégorie créé(s) pour le mois en cours.`);
    console.log(`${String(overallCount)} objectif(s) global(aux) créé(s) pour le mois en cours.`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
