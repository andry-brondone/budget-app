import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

export const StatsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Statistiques</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualisez l'évolution de votre budget.
        </p>
      </div>
      <DashboardCharts />
    </div>
  );
};
