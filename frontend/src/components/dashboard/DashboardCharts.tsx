import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { MonthlyTrendsSection } from '@/components/dashboard/MonthlyTrendsSection';

export const DashboardCharts = () => {
  return (
    <div className="space-y-8">
      <MonthlyTrendsSection />
      <CategoryPieChart />
    </div>
  );
};
