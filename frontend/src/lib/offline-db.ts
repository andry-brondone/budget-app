import Dexie, { type EntityTable } from 'dexie';
import type { TransactionType } from '@/types/transaction.types';

/**
 * Transaction créée hors ligne, en attente de synchronisation avec le
 * serveur. Volontairement limité à la création (voir hooks/useOfflineSync.ts
 * pour le raisonnement) : c'est le scénario le plus utile en pratique
 * ("je suis au marché, pas de réseau, je veux noter cet achat maintenant"),
 * l'édition/suppression restent des actions rares qui peuvent attendre une
 * connexion.
 */
export interface PendingTransaction {
  /** UUID généré localement (clé primaire), différent d'un id serveur. */
  id: string;
  type: TransactionType;
  amount: number;
  description?: string | undefined;
  categoryId?: string | undefined;
  /** Date de la transaction choisie par l'utilisateur (format yyyy-MM-dd). */
  date: string;
  /** Horodatage de mise en file, pour trier par ordre d'ajout. */
  createdAt: string;
}

class OfflineDatabase extends Dexie {
  pendingTransactions!: EntityTable<PendingTransaction, 'id'>;

  constructor() {
    super('vola-offline');
    this.version(1).stores({
      pendingTransactions: 'id, createdAt',
    });
  }
}

export const offlineDb = new OfflineDatabase();
