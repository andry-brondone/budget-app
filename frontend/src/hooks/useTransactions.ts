import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/api-error';
import { offlineDb } from '@/lib/offline-db';
import type { Transaction, TransactionListResponse, TransactionType } from '@/types/transaction.types';
import type { TransactionFormValues } from '@/schemas/transaction.schema';

export interface TransactionFilters {
  type?: TransactionType | undefined;
  categoryId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

const TRANSACTIONS_KEY = 'transactions';

// En création, un champ vide doit être omis (undefined). En mise à jour,
// un champ vidé par l'utilisateur doit être envoyé comme `null` explicite
// pour que le backend le distingue d'un champ "non touché" (undefined) —
// voir le même raisonnement côté backend dans transactions.schema.ts.
const toCreatePayload = (values: TransactionFormValues) => ({
  type: values.type,
  amount: values.amount,
  description: values.description ? values.description : undefined,
  categoryId: values.categoryId ? values.categoryId : undefined,
  date: values.date,
});

const toUpdatePayload = (values: TransactionFormValues) => ({
  type: values.type,
  amount: values.amount,
  description: values.description ? values.description : null,
  categoryId: values.categoryId ? values.categoryId : null,
  date: values.date,
});

export const useTransactionsQuery = (filters: TransactionFilters) => {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, filters],
    queryFn: async () => {
      const response = await apiClient.get<TransactionListResponse>('/transactions', {
        params: filters,
      });
      return response.data;
    },
    // Conserve les données de la page précédente pendant le chargement
    // de la nouvelle page/filtre : évite un flash de "chargement" désagréable.
    placeholderData: keepPreviousData,
  });
};

// Clés de cache à invalider après toute mutation de transaction : les
// totaux de la liste, la consommation des budgets et les graphiques du
// dashboard dépendent tous des transactions.
const invalidateDependentCaches = (queryClient: ReturnType<typeof useQueryClient>): void => {
  void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};

/** Détecte une erreur réseau (requête jamais parvenue au serveur), à
 * distinguer d'une erreur applicative (validation, conflit...) qui elle
 * doit continuer à s'afficher normalement comme une erreur. */
const isNetworkError = (error: unknown): boolean => error instanceof AxiosError && !error.response;

const enqueueOfflineTransaction = async (payload: ReturnType<typeof toCreatePayload>): Promise<void> => {
  await offlineDb.pendingTransactions.add({
    id: crypto.randomUUID(),
    type: payload.type,
    amount: payload.amount,
    description: payload.description,
    categoryId: payload.categoryId,
    date: payload.date,
    createdAt: new Date().toISOString(),
  });
};

type CreateTransactionResult = { queued: true } | { queued: false; transaction: Transaction };

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TransactionFormValues): Promise<CreateTransactionResult> => {
      const payload = toCreatePayload(values);

      // Hors ligne détecté avant même d'essayer : on met en file
      // directement, pas besoin d'attendre l'échec d'une requête qu'on
      // sait déjà vouée à échouer.
      if (!navigator.onLine) {
        await enqueueOfflineTransaction(payload);
        return { queued: true };
      }

      try {
        const response = await apiClient.post<{ transaction: Transaction }>('/transactions', payload);
        return { queued: false, transaction: response.data.transaction };
      } catch (error) {
        // En ligne en apparence mais la requête échoue quand même
        // (connexion instable) : on met en file plutôt que de perdre la
        // saisie de l'utilisateur.
        if (isNetworkError(error)) {
          await enqueueOfflineTransaction(payload);
          return { queued: true };
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      invalidateDependentCaches(queryClient);
      if (result.queued) {
        toast.info('Hors ligne : la transaction sera synchronisée automatiquement au retour du réseau');
      } else {
        toast.success('Transaction ajoutée');
      }
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TransactionFormValues }) => {
      const response = await apiClient.patch<{ transaction: Transaction }>(
        `/transactions/${id}`,
        toUpdatePayload(values),
      );
      return response.data.transaction;
    },
    onSuccess: () => {
      invalidateDependentCaches(queryClient);
      toast.success('Transaction modifiée');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      invalidateDependentCaches(queryClient);
      toast.success('Transaction supprimée');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error));
    },
  });
};
