import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineDb, type PendingTransaction } from '@/lib/offline-db';
import { apiClient } from '@/lib/api-client';

/** Liste réactive des transactions en attente (se met à jour
 * automatiquement à chaque écriture dans la base locale, sans refetch
 * manuel — voir dexie-react-hooks). */
export const usePendingTransactions = (): PendingTransaction[] => {
  const items = useLiveQuery(() => offlineDb.pendingTransactions.orderBy('createdAt').toArray(), []);
  return items ?? [];
};

interface UseOfflineSyncResult {
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

/**
 * Rejoue la file d'attente locale contre l'API dès que la connexion
 * revient. S'arrête au premier échec d'un élément (ex: réseau à nouveau
 * coupé) : les éléments restants seront retentés au prochain passage
 * plutôt que d'échouer en cascade.
 */
export const useOfflineSync = (): UseOfflineSyncResult => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const syncNow = useCallback(async (): Promise<void> => {
    if (isSyncingRef.current) return;

    const pending = await offlineDb.pendingTransactions.orderBy('createdAt').toArray();
    if (pending.length === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    let syncedCount = 0;

    for (const item of pending) {
      try {
        await apiClient.post('/transactions', {
          type: item.type,
          amount: item.amount,
          description: item.description,
          categoryId: item.categoryId,
          date: item.date,
        });
        await offlineDb.pendingTransactions.delete(item.id);
        syncedCount += 1;
      } catch {
        break;
      }
    }

    isSyncingRef.current = false;
    setIsSyncing(false);

    if (syncedCount > 0) {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['budgets'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`${String(syncedCount)} transaction(s) synchronisée(s)`);
    }
  }, [queryClient]);

  // On s'abonne directement à l'événement natif `online` plutôt que de
  // dériver un booléen d'état React (via useOnlineStatus) puis réagir à
  // son changement dans un effet séparé : abonner un effet à un système
  // externe et déclencher la mise à jour d'état depuis le callback
  // d'abonnement est le pattern recommandé par React (par opposition à
  // appeler du code déclenchant un setState directement dans le corps de
  // l'effet).
  useEffect(() => {
    const handleOnline = (): void => {
      void syncNow();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncNow]);

  return { isSyncing, syncNow };
};
