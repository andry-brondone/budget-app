import { createElement, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '@/lib/category-icons';
import { formatAriary } from '@/lib/format-money';
import { useDeleteBudget, useUpdateBudget } from '@/hooks/useBudgets';
import type { Budget } from '@/types/budget.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BudgetProgressCardProps {
  budget: Budget;
}

const getBarColorClass = (percentage: number): string => {
  if (percentage >= 100) return 'bg-rose-500';
  if (percentage >= 80) return 'bg-amber-500';
  return 'bg-brand-500';
};

export const BudgetProgressCard = ({ budget }: BudgetProgressCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amountInput, setAmountInput] = useState(String(budget.amount));
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const IconComponent = useMemo(() => getCategoryIcon(budget.category.icon), [budget.category.icon]);
  const color = getCategoryColor(budget.category.color, budget.category.name);
  const clampedPercentage = Math.min(budget.percentage, 100);

  const handleSaveAmount = (): void => {
    const parsed = Number(amountInput);
    if (!Number.isInteger(parsed) || parsed <= 0) return;

    updateBudget.mutate(
      { id: budget.id, amount: parsed },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = (): void => {
    if (window.confirm(`Supprimer le budget "${budget.category.name}" ?`)) {
      deleteBudget.mutate(budget.id);
    }
  };

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-4 transition-colors dark:border-ink-700 dark:bg-ink-800">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {createElement(IconComponent, { size: 16, className: 'shrink-0', style: { color } })}
          <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {budget.category.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
            }}
            aria-label="Modifier le plafond"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-700 dark:hover:text-slate-300"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Supprimer le budget"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value);
            }}
            className="flex-1"
          />
          <Button
            type="button"
            className="w-auto px-3"
            isLoading={updateBudget.isPending}
            onClick={handleSaveAmount}
          >
            OK
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-700">
            <div
              className={`h-full rounded-full transition-all ${getBarColorClass(budget.percentage)}`}
              style={{ width: `${String(clampedPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {formatAriary(budget.spent)} / {formatAriary(budget.amount)}
            </span>
            <span
              className={
                budget.percentage >= 100 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''
              }
            >
              {String(budget.percentage)}%
            </span>
          </div>
          {budget.percentage >= 100 ? (
            <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">Budget dépassé</p>
          ) : budget.percentage >= 80 ? (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Attention, presque atteint
            </p>
          ) : null}
        </>
      )}
    </div>
  );
};
