import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            V
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bon retour sur Vola</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suivez votre budget, gratuitement et sans limite.
          </p>
        </div>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};
