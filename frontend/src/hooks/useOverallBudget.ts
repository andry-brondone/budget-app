import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/api-error';
import type { OverallBudget } from '@/types/overall-budget.types';

const OVERALL_BUDGET_KEY = 'overall-budget';

export const useOverallBudgetQuery = (month: number, year: number) => {
  return useQuery({
    queryKey: [OVERALL_BUDGET_KEY, month, year],
    queryFn: async () => {
      const response = await apiClient.get<{ overallBudget: OverallBudget }>('/overall-budget', {
        params: { month, year },
      });
      return response.data.overallBudget;
    },
  });
};

export const useUpsertOverallBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { month: number; year: number; amount: number }) => {
      const response = await apiClient.put<{ overallBudget: OverallBudget }>('/overall-budget', input);
      return response.data.overallBudget;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [OVERALL_BUDGET_KEY] });
      toast.success('Objectif mensuel enregistré');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useDeleteOverallBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { month: number; year: number }) => {
      await apiClient.delete('/overall-budget', { params });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [OVERALL_BUDGET_KEY] });
      toast.success('Objectif mensuel supprimé');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};
