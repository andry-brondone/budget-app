import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '@/types/transaction.types';
import { formatAriary } from '@/lib/format-money';
import { formatDateShort } from '@/lib/format-date';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { getCategoryColor, getCategoryIcon } from '@/lib/category-icons';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/transactions/TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = (id: string): void => {
    if (window.confirm('Supprimer cette transaction ?')) {
      deleteTransaction.mutate(id);
    }
  };

  return (
    <>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-800">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'INCOME';
          const CategoryIcon = getCategoryIcon(transaction.category?.icon ?? null);
          const categoryColor = transaction.category
            ? getCategoryColor(transaction.category.color, transaction.category.name)
            : undefined;

          return (
            // `key` sur l'id : une transaction nouvellement créée obtient
            // un nouveau nœud DOM (donc l'animation d'entrée se joue une
            // fois), les lignes existantes ne remontent pas au refetch et
            // ne la rejouent donc pas.
            <div
              key={transaction.id}
              className="animate-fade-in flex items-center gap-4 px-5 py-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isIncome
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {transaction.category ? (
                    <CategoryIcon size={14} className="shrink-0" style={{ color: categoryColor }} />
                  ) : null}
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {transaction.category?.name ?? (isIncome ? 'Revenu' : 'Dépense')}
                  </p>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatDateShort(transaction.date)}
                  {transaction.description ? ` · ${transaction.description}` : ''}
                </p>
              </div>

              <p
                className={`shrink-0 text-sm font-semibold ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatAriary(transaction.amount)}
              </p>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTransaction(transaction);
                  }}
                  aria-label="Modifier"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-700 dark:hover:text-slate-300"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(transaction.id);
                  }}
                  aria-label="Supprimer"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingTransaction ? (
        <Modal
          title="Modifier la transaction"
          onClose={() => {
            setEditingTransaction(null);
          }}
        >
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={() => {
              setEditingTransaction(null);
            }}
          />
        </Modal>
      ) : null}
    </>
  );
};
