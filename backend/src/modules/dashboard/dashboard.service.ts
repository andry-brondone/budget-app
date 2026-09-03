import type { TransactionType } from '../../config/prisma-client.js';
import { prisma } from '../../config/db.js';
import { getMonthDateRange } from '../../shared/date-range.js';
import type { CategoryBreakdownQuery, MonthlySummaryQuery } from './dashboard.schema.js';

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
}

export interface CategoryBreakdownResult {
  type: TransactionType;
  month: number;
  year: number;
  items: CategoryBreakdownItem[];
  total: number;
}

export interface MonthlySummaryItem {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

/**
 * Répartition des transactions d'un mois par catégorie (pour le
 * camembert). Les transactions sans catégorie sont regroupées sous une
 * entrée "Sans catégorie" plutôt que d'être ignorées.
 */
export const getCategoryBreakdown = async (
  userId: string,
  query: CategoryBreakdownQuery,
): Promise<CategoryBreakdownResult> => {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();
  const type = query.type ?? 'EXPENSE';
  const { start, end } = getMonthDateRange(month, year);

  const transactions = await prisma.transaction.findMany({
    where: { userId, type, date: { gte: start, lt: end } },
    include: { category: true },
  });

  interface Accumulator {
    name: string;
    icon: string | null;
    color: string | null;
    amount: number;
  }

  const byCategory = new Map<string, Accumulator>();
  let total = 0;

  for (const transaction of transactions) {
    total += transaction.amount;
    const key = transaction.categoryId ?? 'uncategorized';
    const existing = byCategory.get(key);

    if (existing) {
      existing.amount += transaction.amount;
    } else {
      byCategory.set(key, {
        name: transaction.category?.name ?? 'Sans catégorie',
        icon: transaction.category?.icon ?? null,
        color: transaction.category?.color ?? null,
        amount: transaction.amount,
      });
    }
  }

  const items = Array.from(byCategory.entries())
    .map(([key, value]) => ({
      categoryId: key === 'uncategorized' ? null : key,
      name: value.name,
      icon: value.icon,
      color: value.color,
      amount: value.amount,
      percentage: total > 0 ? Math.round((value.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { type, month, year, items, total };
};

/**
 * Revenus / dépenses / solde net pour chacun des N derniers mois
 * (incluant le mois en cours). Sert à la fois le graphique "revenus vs
 * dépenses" (barres) et la courbe de solde (ligne) côté frontend, à
 * partir d'un seul jeu de données.
 *
 * L'agrégation est faite en mémoire plutôt qu'en SQL (pas de group-by-mois
 * natif portable dans Prisma sans requête brute) : pour un volume de
 * données de budget personnel, c'est largement suffisant et évite
 * d'introduire du SQL brut dans le projet.
 */
export const getMonthlySummary = async (
  userId: string,
  query: MonthlySummaryQuery,
): Promise<MonthlySummaryItem[]> => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const periods: { month: number; year: number }[] = [];
  for (let offset = query.months - 1; offset >= 0; offset -= 1) {
    let month = currentMonth - offset;
    let year = currentYear;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }
    periods.push({ month, year });
  }

  const firstPeriod = periods[0];
  if (!firstPeriod) return [];

  const rangeStart = getMonthDateRange(firstPeriod.month, firstPeriod.year).start;
  const rangeEnd = getMonthDateRange(currentMonth, currentYear).end;

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { type: true, amount: true, date: true },
  });

  const buckets = new Map<string, { income: number; expense: number }>();
  for (const period of periods) {
    buckets.set(`${String(period.year)}-${String(period.month)}`, { income: 0, expense: 0 });
  }

  for (const transaction of transactions) {
    const key = `${String(transaction.date.getUTCFullYear())}-${String(transaction.date.getUTCMonth() + 1)}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (transaction.type === 'INCOME') {
      bucket.income += transaction.amount;
    } else {
      bucket.expense += transaction.amount;
    }
  }

  return periods.map((period) => {
    const bucket = buckets.get(`${String(period.year)}-${String(period.month)}`) ?? {
      income: 0,
      expense: 0,
    };

    return {
      month: period.month,
      year: period.year,
      income: bucket.income,
      expense: bucket.expense,
      net: bucket.income - bucket.expense,
    };
  });
};
