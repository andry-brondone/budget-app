import { create } from 'zustand';

interface UIState {
  isAddTransactionModalOpen: boolean;
  openAddTransactionModal: () => void;
  closeAddTransactionModal: () => void;
}

/**
 * État d'interface partagé entre des points d'entrée distincts. Le
 * bouton d'action flottant de la barre de navigation mobile doit pouvoir
 * ouvrir le formulaire d'ajout de transaction depuis n'importe quelle
 * page, alors que ce formulaire était auparavant piloté par un état
 * local du tableau de bord : un store global évite de faire remonter
 * cet état dans un contexte React dédié pour un besoin aussi ponctuel.
 */
export const useUIStore = create<UIState>((set) => ({
  isAddTransactionModalOpen: false,
  openAddTransactionModal: () => {
    set({ isAddTransactionModalOpen: true });
  },
  closeAddTransactionModal: () => {
    set({ isAddTransactionModalOpen: false });
  },
}));
