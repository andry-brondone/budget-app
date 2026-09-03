import { useBootstrapSession } from '@/hooks/useAuth';
import { AppRouter } from '@/routes/AppRouter';
import { SplashScreen } from '@/components/layout/SplashScreen';

export const App = () => {
  const { isLoading } = useBootstrapSession();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <AppRouter />;
};
