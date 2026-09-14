import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

const getPreviousMonth = (month: number, year: number): { month: number; year: number } =>
  month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };

/**
 * Reconduit automatiquement les budgets du mois précédent vers le mois en
 * cours : pour chaque budget existant le mois dernier, crée un budget
 * identique (même catégorie, même plafond) ce mois-ci s'il n'existe pas
 * déjà. Idempotent — peut être relancé sans créer de doublons (protégé
 * par la contrainte unique [userId, categoryId, month, year]).
 *
 * Ceci répond au besoin de "reset mensuel" du budget : les dépenses d'un
 * budget sont déjà scopées par mois/année (donc "remises à zéro"
 * automatiquement, sans action nécessaire) — ce qui manquait réellement
 * était d'éviter à l'utilisateur de ressaisir ses plafonds chaque mois.
 */
export const rolloverBudgetsForCurrentMonth = async (): Promise<number> => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const previous = getPreviousMonth(currentMonth, currentYear);

  const previousBudgets = await prisma.budget.findMany({
    where: { month: previous.month, year: previous.year },
  });

  let createdCount = 0;

  for (const budget of previousBudgets) {
    const existing = await prisma.budget.findFirst({
      where: {
        userId: budget.userId,
        categoryId: budget.categoryId,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (existing) continue;

    await prisma.budget.create({
      data: {
        userId: budget.userId,
        categoryId: budget.categoryId,
        month: currentMonth,
        year: currentYear,
        amount: budget.amount,
      },
    });
    createdCount += 1;
  }

  return createdCount;
};

/**
 * Reconduit l'objectif de dépenses global (indépendant des catégories,
 * voir modèle OverallBudget) du mois précédent vers le mois en cours,
 * selon le même principe et la même contrainte d'idempotence que
 * `rolloverBudgetsForCurrentMonth` ci-dessus.
 */
export const rolloverOverallBudgetForCurrentMonth = async (): Promise<number> => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const previous = getPreviousMonth(currentMonth, currentYear);

  const previousOverallBudgets = await prisma.overallBudget.findMany({
    where: { month: previous.month, year: previous.year },
  });

  let createdCount = 0;

  for (const overallBudget of previousOverallBudgets) {
    const existing = await prisma.overallBudget.findUnique({
      where: {
        userId_month_year: { userId: overallBudget.userId, month: currentMonth, year: currentYear },
      },
    });

    if (existing) continue;

    await prisma.overallBudget.create({
      data: {
        userId: overallBudget.userId,
        month: currentMonth,
        year: currentYear,
        amount: overallBudget.amount,
      },
    });
    createdCount += 1;
  }

  return createdCount;
};

/** Programme la reconduction pour s'exécuter à minuit le 1er de chaque
 * mois, à l'heure de Madagascar. Couvre à la fois les budgets par
 * catégorie et l'objectif global mensuel. */
export const scheduleMonthlyBudgetRollover = (): void => {
  cron.schedule(
    '0 0 1 * *',
    () => {
      Promise.all([rolloverBudgetsForCurrentMonth(), rolloverOverallBudgetForCurrentMonth()])
        .then(([categoryCount, overallCount]) => {
          logger.info(
            `Reconduction des budgets : ${String(categoryCount)} budget(s) par catégorie et ${String(overallCount)} objectif(s) global(aux) créés pour le nouveau mois.`,
          );
        })
        .catch((error: unknown) => {
          logger.error({ error }, 'Échec de la reconduction automatique des budgets');
        });
    },
    { timezone: 'Indian/Antananarivo' },
  );
};
