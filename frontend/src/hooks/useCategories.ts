import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/api-error';
import type { Category } from '@/types/category.types';
import type { TransactionType } from '@/types/transaction.types';
import type { CategoryFormValues } from '@/schemas/category.schema';

const CATEGORIES_KEY = 'categories';

export const useCategoriesQuery = (type?: TransactionType) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, type ?? 'all'],
    queryFn: async () => {
      const response = await apiClient.get<{ categories: Category[] }>('/categories', {
        params: type ? { type } : undefined,
      });
      return response.data.categories;
    },
    // Les catégories changent rarement : on évite de refetch trop souvent.
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const response = await apiClient.post<{ category: Category }>('/categories', {
        name: values.name,
        type: values.type,
      });
      return response.data.category;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success('Catégorie ajoutée');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      // Les transactions liées à cette catégorie ont été détachées
      // (categoryId -> null) côté backend : on rafraîchit leur affichage.
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Catégorie supprimée');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};
