import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export const AppLayout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const isAddTransactionModalOpen = useUIStore((state) => state.isAddTransactionModalOpen);
  const closeAddTransactionModal = useUIStore((state) => state.closeAddTransactionModal);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-950">
      <Sidebar />

      {/* Le décalage à gauche (md:pl-64) compense la largeur de la
          barre latérale fixe sur desktop ; le padding bas (pb-24)
          réserve l'espace occupé par la navigation mobile fixée en bas
          d'écran, pour qu'elle ne recouvre jamais le contenu. */}
      <div className="flex min-h-screen flex-col pb-24 md:pb-0 md:pl-64">
        <OfflineBanner />

        {/* `key` sur le chemin : force un remount du contenu à chaque
            changement de page, ce qui rejoue l'animation d'entrée CSS
            (une transition de page légère, sans librairie dédiée). */}
        <main key={location.pathname} className="animate-fade-in mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <BottomNav />

      {isAddTransactionModalOpen ? (
        <Modal title="Nouvelle transaction" onClose={closeAddTransactionModal}>
          <TransactionForm onSuccess={closeAddTransactionModal} />
        </Modal>
      ) : null}
    </div>
  );
};
