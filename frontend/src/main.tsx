import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { OfflineSyncProvider } from '@/lib/offline-sync-context';
import '@/lib/chart-setup';
import { App } from '@/App';
import '@/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Élément racine #root introuvable');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineSyncProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </OfflineSyncProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
