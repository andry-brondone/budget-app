import { Spinner } from '@/components/ui/Spinner';

export const SplashScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-10 w-10 border-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement de Vola...</p>
      </div>
    </div>
  );
};
