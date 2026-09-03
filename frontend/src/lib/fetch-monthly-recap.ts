import { apiClient } from '@/lib/api-client';
import type { Transaction, TransactionListResponse } from '@/types/transaction.types';
import type { Budget } from '@/types/budget.types';

export interface MonthlyRecapData {
  month: number;
  year: number;
  transactions: Transaction[];
  budgets: Budget[];
  totals: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

const MAX_PAGE_SIZE = 100;

/** Dernier jour du mois (28-31), en tenant compte des années bissextiles. */
const getLastDayOfMonth = (month: number, year: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const toIsoDate = (year: number, month: number, day: number): string =>
  `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/**
 * Récupère la totalité des transactions du mois, sans se limiter à la
 * première page : l'export doit refléter l'intégralité des données, pas
 * seulement l'aperçu paginé affiché dans le tableau de bord.
 */
const fetchAllTransactionsForMonth = async (
  month: number,
  year: number,
): Promise<{
  transactions: Transaction[];
  totals: { totalIncome: number; totalExpense: number; balance: number };
}> => {
  const dateFrom = toIsoDate(year, month, 1);
  const dateTo = toIsoDate(year, month, getLastDayOfMonth(month, year));
  const baseParams = { dateFrom, dateTo, pageSize: MAX_PAGE_SIZE };

  const firstResponse = await apiClient.get<TransactionListResponse>('/transactions', {
    params: { ...baseParams, page: 1 },
  });

  const transactions: Transaction[] = [...firstResponse.data.transactions];
  const { totals, pagination } = firstResponse.data;

  for (let page = 2; page <= pagination.totalPages; page += 1) {
    const response = await apiClient.get<TransactionListResponse>('/transactions', {
      params: { ...baseParams, page },
    });
    transactions.push(...response.data.transactions);
  }

  return { transactions, totals };
};

export const fetchMonthlyRecap = async (month: number, year: number): Promise<MonthlyRecapData> => {
  const [{ transactions, totals }, budgetsResponse] = await Promise.all([
    fetchAllTransactionsForMonth(month, year),
    apiClient.get<{ budgets: Budget[] }>('/budgets', { params: { month, year } }),
  ]);

  return {
    month,
    year,
    transactions,
    budgets: budgetsResponse.data.budgets,
    totals,
  };
};
