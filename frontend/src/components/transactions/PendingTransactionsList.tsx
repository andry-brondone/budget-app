import { Clock } from 'lucide-react';
import { usePendingTransactions } from '@/hooks/useOfflineSync';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineSyncContext } from '@/lib/offline-sync-context';
import { formatAriary } from '@/lib/format-money';

export const PendingTransactionsList = () => {
  const pending = usePendingTransactions();
  const { data: categories } = useCategoriesQuery();
  const isOnline = useOnlineStatus();
  const { isSyncing, syncNow } = useOfflineSyncContext();

  if (pending.length === 0) return null;

  return (
    <div className="animate-fade-in space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <Clock size={14} />
          {pending.length} transaction{pending.length > 1 ? 's' : ''} en attente de synchronisation
        </div>
        {isOnline ? (
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={isSyncing}
            className="text-xs font-medium text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400"
          >
            {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </button>
        ) : null}
      </div>

      <div className="divide-y divide-amber-100 overflow-hidden rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 dark:divide-amber-900/40 dark:border-amber-900/50 dark:bg-amber-950/20">
        {pending.map((item) => {
          const category = categories?.find((candidate) => candidate.id === item.categoryId);
          const isIncome = item.type === 'INCOME';

          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <Clock size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                  {category?.name ?? (isIncome ? 'Revenu' : 'Dépense')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">En attente de synchronisation</p>
              </div>

              <p
                className={`shrink-0 text-sm font-semibold ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatAriary(item.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
