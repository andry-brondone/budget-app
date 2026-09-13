import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/cn';

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition',
    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500',
  );

/**
 * Navigation principale pour les largeurs d'écran mobile (en dessous de
 * `md`), fixée en bas de l'écran. Le bouton central, surélevé au-dessus
 * de la barre, ouvre le formulaire d'ajout de transaction depuis
 * n'importe quelle page via le store UI partagé (voir stores/ui.store.ts)
 * plutôt que de dépendre d'un état local du tableau de bord.
 */
export const BottomNav = () => {
  const openAddTransactionModal = useUIStore((state) => state.openAddTransactionModal);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] transition-colors md:hidden dark:border-ink-800 dark:bg-ink-900">
      <div className="relative mx-auto flex max-w-md items-center px-2">
        <NavLink to="/dashboard" className={navLinkClassName}>
          <LayoutDashboard size={20} />
          Accueil
        </NavLink>

        {/* Espace réservé sous le bouton flottant, pour que les deux
            liens de navigation restent centrés de part et d'autre. */}
        <div className="w-16 shrink-0" />

        <NavLink to="/stats" className={navLinkClassName}>
          <LineChart size={20} />
          Stats
        </NavLink>

        <button
          type="button"
          onClick={openAddTransactionModal}
          aria-label="Ajouter une transaction"
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition active:scale-95 dark:bg-brand-400 dark:text-ink-950 dark:shadow-brand-400/20"
        >
          <Plus size={26} />
        </button>
      </div>
    </nav>
  );
};
