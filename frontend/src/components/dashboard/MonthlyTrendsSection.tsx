import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { useMonthlySummaryQuery } from '@/hooks/useDashboard';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { formatAriary } from '@/lib/format-money';
import { getMonthLabelShort } from '@/lib/date-labels';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';

// Chart.js dessine sur un <canvas> : ses couleurs (ticks, grilles,
// légende) ne s'adaptent pas automatiquement au thème CSS comme le reste
// de l'UI. On doit donc les recalculer explicitement selon le thème
// actif plutôt que de les fixer une fois pour toutes en constante de
// module — les tooltips, eux, gardent un fond sombre semi-transparent
// par défaut dans les deux thèmes, donc restent lisibles sans ajustement.
const getTickColor = (theme: Theme): string => (theme === 'dark' ? '#94a3b8' : '#64748b');
const getGridColor = (theme: Theme): string => (theme === 'dark' ? '#334155' : '#e2e8f0');

export const MonthlyTrendsSection = () => {
  const [monthsCount, setMonthsCount] = useState(6);
  const { data, isLoading } = useMonthlySummaryQuery(monthsCount);
  const { theme } = useTheme();

  const tickColor = getTickColor(theme);
  const gridColor = getGridColor(theme);

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: tickColor } },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label ?? ''}: ${formatAriary(Number(context.raw))}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: {
        ticks: { color: tickColor, callback: (value) => formatAriary(Number(value)) },
        grid: { color: gridColor },
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Solde : ${formatAriary(Number(context.raw))}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: {
        ticks: { color: tickColor, callback: (value) => formatAriary(Number(value)) },
        grid: { color: gridColor },
      },
    },
  };

  const labels = data?.map((item) => `${getMonthLabelShort(item.month)} ${String(item.year).slice(2)}`) ?? [];

  const barData = {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: data?.map((item) => item.income) ?? [],
        backgroundColor: '#22c55e',
        borderRadius: 6,
      },
      {
        label: 'Dépenses',
        data: data?.map((item) => item.expense) ?? [],
        backgroundColor: '#f43f5e',
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Solde net',
        data: data?.map((item) => item.net) ?? [],
        borderColor: '#10945b',
        backgroundColor: '#10945b33',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Évolution</h2>
        <Select
          value={monthsCount}
          onChange={(event) => {
            setMonthsCount(Number(event.target.value));
          }}
          className="w-40"
        >
          <option value={6}>6 derniers mois</option>
          <option value={12}>12 derniers mois</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            Revenus vs Dépenses
          </h3>
          <div className="h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            Solde net mensuel
          </h3>
          <div className="h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <Line data={lineData} options={lineOptions} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
