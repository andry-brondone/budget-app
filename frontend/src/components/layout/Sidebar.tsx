import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, LogOut } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/stats', label: 'Statistiques', icon: LineChart },
];

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-400'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-slate-200',
  );

/**
 * Navigation principale pour les largeurs d'écran desktop (`md` et
 * plus). Remplace la navigation en barre horizontale sur mobile, voir
 * BottomNav.tsx pour son équivalent mobile.
 */
export const Sidebar = () => {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-colors md:flex dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white dark:bg-brand-400 dark:text-ink-950">
          V
        </div>
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Vola</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClassName}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-ink-800">
        <div className="flex items-center justify-between px-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={user?.name ?? '?'} size="sm" />
            <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
              {user?.name}
            </span>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => {
            logout.mutate();
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-slate-200"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
