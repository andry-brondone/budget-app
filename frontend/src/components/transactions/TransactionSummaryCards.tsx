import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatAriary } from '@/lib/format-money';

interface TransactionSummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const TransactionSummaryCards = ({
  totalIncome,
  totalExpense,
  balance,
}: TransactionSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
          <Wallet size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Solde</p>
          <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatAriary(balance)}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <ArrowUpRight size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenus</p>
          <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatAriary(totalIncome)}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <ArrowDownRight size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Dépenses</p>
          <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatAriary(totalExpense)}
          </p>
        </div>
      </Card>
    </div>
  );
};
