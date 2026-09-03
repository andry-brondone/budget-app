import type { Budget, Category } from '../../config/prisma-client.js';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';
import { getMonthDateRange } from '../../shared/date-range.js';
import type { CreateBudgetInput, ListBudgetsQuery, UpdateBudgetInput } from './budgets.schema.js';

export interface EmbeddedCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface BudgetDTO {
  id: string;
  categoryId: string;
  category: EmbeddedCategory;
  month: number;
  year: number;
  amount: number;
  spent: number;
  remaining: number;
  /** Pourcentage consommé, peut dépasser 100 en cas de dépassement. */
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const toDTO = (budget: Budget & { category: Category }, spent: number): BudgetDTO => {
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

  return {
    id: budget.id,
    categoryId: budget.categoryId,
    category: {
      id: budget.category.id,
      name: budget.category.name,
      icon: budget.category.icon,
      color: budget.category.color,
    },
    month: budget.month,
    year: budget.year,
    amount: budget.amount,
    spent,
    remaining,
    percentage,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
};

const computeSpent = async (
  userId: string,
  categoryId: string,
  month: number,
  year: number,
): Promise<number> => {
  const { start, end } = getMonthDateRange(month, year);
  const result = await prisma.transaction.aggregate({
    where: { userId, categoryId, type: 'EXPENSE', date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
};

export const listBudgets = async (userId: string, query: ListBudgetsQuery): Promise<BudgetDTO[]> => {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();
  const { start, end } = getMonthDateRange(month, year);

  // Une seule requête d'agrégation pour toutes les catégories du mois,
  // plutôt qu'une requête par budget (évite le N+1).
  const [budgets, spentByCategory] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', categoryId: { not: null }, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  const spentMap = new Map<string, number>();
  for (const row of spentByCategory) {
    if (row.categoryId) {
      spentMap.set(row.categoryId, row._sum.amount ?? 0);
    }
  }

  return budgets.map((budget) => toDTO(budget, spentMap.get(budget.categoryId) ?? 0));
};

export const createBudget = async (userId: string, input: CreateBudgetInput): Promise<BudgetDTO> => {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, OR: [{ userId: null }, { userId }] },
  });

  if (!category) throw ApiError.badRequest('Catégorie invalide');
  if (category.type !== 'EXPENSE') {
    throw ApiError.badRequest('Un budget ne peut être défini que pour une catégorie de dépense');
  }

  const existing = await prisma.budget.findFirst({
    where: { userId, categoryId: input.categoryId, month: input.month, year: input.year },
  });
  if (existing) throw ApiError.conflict('Un budget existe déjà pour cette catégorie ce mois-ci');

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
      amount: input.amount,
    },
    include: { category: true },
  });

  // On calcule les dépenses déjà engagées ce mois-ci plutôt que de
  // supposer 0 : un budget peut être créé après coup, en milieu de mois.
  const spent = await computeSpent(userId, input.categoryId, input.month, input.year);
  return toDTO(budget, spent);
};

export const updateBudget = async (
  userId: string,
  id: string,
  input: UpdateBudgetInput,
): Promise<BudgetDTO> => {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Budget introuvable');

  const budget = await prisma.budget.update({
    where: { id },
    data: { amount: input.amount },
    include: { category: true },
  });

  const spent = await computeSpent(userId, budget.categoryId, budget.month, budget.year);
  return toDTO(budget, spent);
};

export const deleteBudget = async (userId: string, id: string): Promise<void> => {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Budget introuvable');
  await prisma.budget.delete({ where: { id } });
};
