import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Wallet2 } from 'lucide-react';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { getMonthLabel } from '@/lib/date-labels';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

interface Period {
  month: number;
  year: number;
}

const getCurrentPeriod = (): Period => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const BudgetSection = () => {
  const [period, setPeriod] = useState<Period>(getCurrentPeriod);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: budgets, isLoading } = useBudgetsQuery(period.month, period.year);

  const goToPreviousMonth = (): void => {
    setPeriod((prev) =>
      prev.month === 1 ? { month: 12, year: prev.year - 1 } : { month: prev.month - 1, year: prev.year },
    );
  };

  const goToNextMonth = (): void => {
    setPeriod((prev) =>
      prev.month === 12 ? { month: 1, year: prev.year + 1 } : { month: prev.month + 1, year: prev.year },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet2 size={18} className="text-slate-400 dark:text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Budgets mensuels</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Mois précédent"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-28 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            {getMonthLabel(period.month)} {period.year}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Mois suivant"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="h-5 w-5" />
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetProgressCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet2}
          title="Aucun budget ce mois-ci"
          description="Définis un plafond mensuel par catégorie pour suivre tes dépenses."
        />
      )}

      <Button
        type="button"
        variant="ghost"
        className="w-auto px-3"
        onClick={() => {
          setIsAddModalOpen(true);
        }}
      >
        <span className="flex items-center gap-1.5">
          <Plus size={16} />
          Ajouter un budget
        </span>
      </Button>

      {isAddModalOpen ? (
        <Modal
          title="Nouveau budget"
          onClose={() => {
            setIsAddModalOpen(false);
          }}
        >
          <BudgetForm
            month={period.month}
            year={period.year}
            excludedCategoryIds={(budgets ?? []).map((budget) => budget.categoryId)}
            onSuccess={() => {
              setIsAddModalOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
};
