import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  );

export const AppLayout = ({ children }: PropsWithChildren) => {
  const user = useCurrentUser();
  const logout = useLogout();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <OfflineBanner />
      <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                V
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Vola</span>
            </div>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/dashboard" className={navLinkClassName}>
                <LayoutDashboard size={16} />
                Tableau de bord
              </NavLink>
              <NavLink to="/stats" className={navLinkClassName}>
                <LineChart size={16} />
                Statistiques
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
              {user?.name}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout.mutate();
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Déconnexion
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-1 border-t border-slate-100 px-4 py-2 sm:hidden dark:border-slate-800">
          <NavLink to="/dashboard" className={navLinkClassName}>
            <LayoutDashboard size={16} />
            Tableau de bord
          </NavLink>
          <NavLink to="/stats" className={navLinkClassName}>
            <LineChart size={16} />
            Statistiques
          </NavLink>
        </nav>
      </header>
      {/* `key` sur le chemin : force un remount du contenu à chaque
          changement de page, ce qui rejoue l'animation d'entrée CSS
          (une transition de page légère, sans librairie dédiée). */}
      <main key={location.pathname} className="animate-fade-in mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
};
