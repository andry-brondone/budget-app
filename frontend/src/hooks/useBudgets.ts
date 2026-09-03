import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/api-error';
import type { Budget } from '@/types/budget.types';
import type { BudgetFormValues } from '@/schemas/budget.schema';

const BUDGETS_KEY = 'budgets';

export const useBudgetsQuery = (month: number, year: number) => {
  return useQuery({
    queryKey: [BUDGETS_KEY, month, year],
    queryFn: async () => {
      const response = await apiClient.get<{ budgets: Budget[] }>('/budgets', {
        params: { month, year },
      });
      return response.data.budgets;
    },
  });
};

export const useCreateBudget = (month: number, year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: BudgetFormValues) => {
      const response = await apiClient.post<{ budget: Budget }>('/budgets', {
        categoryId: values.categoryId,
        amount: values.amount,
        month,
        year,
      });
      return response.data.budget;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
      toast.success('Budget créé');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await apiClient.patch<{ budget: Budget }>(`/budgets/${id}`, { amount });
      return response.data.budget;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
      toast.success('Budget modifié');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
      toast.success('Budget supprimé');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};
