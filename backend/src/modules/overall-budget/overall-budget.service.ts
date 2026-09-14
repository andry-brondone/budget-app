import type { OverallBudget } from '../../config/prisma-client.js';
import { prisma } from '../../config/db.js';
import { getMonthDateRange } from '../../shared/date-range.js';
import type {
  DeleteOverallBudgetQuery,
  GetOverallBudgetQuery,
  UpsertOverallBudgetInput,
} from './overall-budget.schema.js';

export interface OverallBudgetDTO {
  id: string | null;
  month: number;
  year: number;
  /** `null` tant qu'aucun objectif n'a été défini pour ce mois. */
  amount: number | null;
  spent: number;
  remaining: number | null;
  /** Pourcentage consommé, peut dépasser 100 en cas de dépassement.
   * `null` tant qu'aucun objectif n'a été défini. */
  percentage: number | null;
}

const computeSpent = async (userId: string, month: number, year: number): Promise<number> => {
  const { start, end } = getMonthDateRange(month, year);
  const result = await prisma.transaction.aggregate({
    where: { userId, type: 'EXPENSE', date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
};

const toDTO = (
  overallBudget: OverallBudget | null,
  month: number,
  year: number,
  spent: number,
): OverallBudgetDTO => {
  const amount = overallBudget?.amount ?? null;
  const remaining = amount !== null ? amount - spent : null;
  const percentage = amount !== null && amount > 0 ? Math.round((spent / amount) * 100) : null;

  return {
    id: overallBudget?.id ?? null,
    month,
    year,
    amount,
    spent,
    remaining,
    percentage,
  };
};

export const getOverallBudget = async (
  userId: string,
  query: GetOverallBudgetQuery,
): Promise<OverallBudgetDTO> => {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  const [overallBudget, spent] = await Promise.all([
    prisma.overallBudget.findUnique({ where: { userId_month_year: { userId, month, year } } }),
    computeSpent(userId, month, year),
  ]);

  return toDTO(overallBudget, month, year, spent);
};

export const upsertOverallBudget = async (
  userId: string,
  input: UpsertOverallBudgetInput,
): Promise<OverallBudgetDTO> => {
  const [overallBudget, spent] = await Promise.all([
    prisma.overallBudget.upsert({
      where: { userId_month_year: { userId, month: input.month, year: input.year } },
      create: { userId, month: input.month, year: input.year, amount: input.amount },
      update: { amount: input.amount },
    }),
    computeSpent(userId, input.month, input.year),
  ]);

  return toDTO(overallBudget, input.month, input.year, spent);
};

export const deleteOverallBudget = async (
  userId: string,
  query: DeleteOverallBudgetQuery,
): Promise<void> => {
  // deleteMany plutôt que delete : évite d'avoir à récupérer l'id au
  // préalable, et ne lève pas d'erreur si l'objectif n'existe déjà plus
  // (opération idempotente, cohérent avec une action de suppression).
  await prisma.overallBudget.deleteMany({
    where: { userId, month: query.month, year: query.year },
  });
};
