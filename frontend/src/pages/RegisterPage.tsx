import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui/Card';

export const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-ink-950">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            V
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Créez votre compte Vola</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gratuit à vie. Aucune carte bancaire requise.
          </p>
        </div>
        <Card>
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
};
