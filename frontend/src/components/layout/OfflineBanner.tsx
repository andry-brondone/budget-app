import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="animate-fade-in flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
      <WifiOff size={14} className="shrink-0" />
      Mode hors ligne — les nouvelles transactions seront synchronisées au retour du réseau
    </div>
  );
};
