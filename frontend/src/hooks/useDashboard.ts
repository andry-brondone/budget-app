import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CategoryBreakdownResponse, MonthlySummaryItem } from '@/types/dashboard.types';
import type { TransactionType } from '@/types/transaction.types';

const DASHBOARD_KEY = 'dashboard';

export const useCategoryBreakdownQuery = (month: number, year: number, type: TransactionType) => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'category-breakdown', month, year, type],
    queryFn: async () => {
      const response = await apiClient.get<CategoryBreakdownResponse>('/dashboard/category-breakdown', {
        params: { month, year, type },
      });
      return response.data;
    },
  });
};

export const useMonthlySummaryQuery = (months: number) => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'monthly-summary', months],
    queryFn: async () => {
      const response = await apiClient.get<{ items: MonthlySummaryItem[] }>('/dashboard/monthly-summary', {
        params: { months },
      });
      return response.data.items;
    },
  });
};
