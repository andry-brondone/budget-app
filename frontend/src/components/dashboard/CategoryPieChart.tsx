import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon } from 'lucide-react';
import { useCategoryBreakdownQuery } from '@/hooks/useDashboard';
import { formatAriary } from '@/lib/format-money';
import { getMonthLabel } from '@/lib/date-labels';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { TransactionType } from '@/types/transaction.types';

interface Period {
  month: number;
  year: number;
}

const getCurrentPeriod = (): Period => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// Légende désactivée : on affiche une légende HTML personnalisée
// à la place (déjà thématisée via Tailwind dark:), ce qui évite de
// devoir recolorer une légende Chart.js selon le thème actif.
const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => ` ${formatAriary(Number(context.raw))}`,
      },
    },
  },
};

export const CategoryPieChart = () => {
  const [period, setPeriod] = useState<Period>(getCurrentPeriod);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const { data, isLoading } = useCategoryBreakdownQuery(period.month, period.year, type);

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

  const chartData = data
    ? {
        labels: data.items.map((item) => item.name),
        datasets: [
          {
            data: data.items.map((item) => item.amount),
            backgroundColor: data.items.map((item) => item.color ?? '#94a3b8'),
            borderWidth: 0,
          },
        ],
      }
    : null;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Répartition par catégorie
        </h3>
        <div className="flex items-center gap-2">
          <Select
            value={type}
            onChange={(event) => {
              setType(event.target.value === 'INCOME' ? 'INCOME' : 'EXPENSE');
            }}
            className="w-32"
          >
            <option value="EXPENSE">Dépenses</option>
            <option value="INCOME">Revenus</option>
          </Select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Mois précédent"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="w-24 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
              {getMonthLabel(period.month)} {period.year}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Mois suivant"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="h-56 w-56 shrink-0">
            {chartData ? <Doughnut data={chartData} options={doughnutOptions} /> : null}
          </div>
          <div className="w-full space-y-2">
            {data.items.map((item) => (
              <div
                key={item.categoryId ?? 'uncategorized'}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color ?? '#94a3b8' }}
                  />
                  <span className="truncate text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span>{formatAriary(item.amount)}</span>
                  <span className="w-10 text-right text-xs">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={PieChartIcon}
          title="Aucune donnée"
          description="Aucune transaction pour cette période."
        />
      )}
    </Card>
  );
};
