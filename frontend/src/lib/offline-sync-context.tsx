import { createContext, useContext, type PropsWithChildren } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface OfflineSyncContextValue {
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

/**
 * `useOfflineSync` doit être instancié une seule fois pour toute l'app
 * (sinon plusieurs boucles de synchronisation concurrentes pourraient se
 * déclencher si plusieurs composants l'appelaient indépendamment). Ce
 * provider centralise l'instance et la partage via le contexte.
 */
export const OfflineSyncProvider = ({ children }: PropsWithChildren) => {
  const value = useOfflineSync();
  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
};

export const useOfflineSyncContext = (): OfflineSyncContextValue => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSyncContext doit être utilisé à l’intérieur de <OfflineSyncProvider>');
  }
  return context;
};
