import { useState } from 'react';
import { Download, Plus, Receipt, Tags } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useTransactionsQuery, type TransactionFilters as TransactionFiltersValue } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { PendingTransactionsList } from '@/components/transactions/PendingTransactionsList';
import { BudgetSection } from '@/components/budgets/BudgetSection';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { ExportModal } from '@/components/export/ExportModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';

export const DashboardPage = () => {
  const user = useCurrentUser();
  const [filters, setFilters] = useState<TransactionFiltersValue>({ page: 1, pageSize: 20 });
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Le formulaire d'ajout de transaction est rendu au niveau du layout
  // (voir components/layout/AppLayout.tsx) afin d'être également
  // accessible depuis le bouton d'action flottant de la navigation
  // mobile. Le bouton "Ajouter" de cette page ne fait que déclencher le
  // même état partagé plutôt que de dupliquer sa propre instance de modale.
  const openAddTransactionModal = useUIStore((state) => state.openAddTransactionModal);

  const { data, isLoading } = useTransactionsQuery(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Bonjour, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Voici un aperçu de vos finances.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="w-auto px-3"
            onClick={() => {
              setIsExportModalOpen(true);
            }}
          >
            <span className="flex items-center gap-1.5">
              <Download size={16} />
              <span className="hidden sm:inline">Exporter</span>
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-auto px-3"
            onClick={() => {
              setIsCategoryManagerOpen(true);
            }}
          >
            <span className="flex items-center gap-1.5">
              <Tags size={16} />
              <span className="hidden sm:inline">Catégories</span>
            </span>
          </Button>
          <Button type="button" className="w-auto px-4" onClick={openAddTransactionModal}>
            <span className="flex items-center gap-1.5">
              <Plus size={16} />
              Ajouter
            </span>
          </Button>
        </div>
      </div>

      <PendingTransactionsList />

      <TransactionSummaryCards
        totalIncome={data?.totals.totalIncome ?? 0}
        totalExpense={data?.totals.totalExpense ?? 0}
        balance={data?.totals.balance ?? 0}
      />

      <BudgetSection />

      <TransactionFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      ) : data && data.transactions.length > 0 ? (
        <>
          <TransactionList transactions={data.transactions} />
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={(page) => {
              setFilters((prev) => ({ ...prev, page }));
            }}
          />
        </>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Aucune transaction"
          description="Ajoutez votre première dépense ou revenu pour commencer à suivre votre budget."
        />
      )}

      {isCategoryManagerOpen ? (
        <Modal
          title="Mes catégories"
          onClose={() => {
            setIsCategoryManagerOpen(false);
          }}
        >
          <CategoryManager />
        </Modal>
      ) : null}

      {isExportModalOpen ? (
        <Modal
          title="Exporter un récapitulatif"
          onClose={() => {
            setIsExportModalOpen(false);
          }}
        >
          <ExportModal
            onClose={() => {
              setIsExportModalOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
};
