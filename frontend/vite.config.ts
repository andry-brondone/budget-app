import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Nécessaire pour scoper précisément le cache Workbox à la bonne origine
  // (le frontend et l'API peuvent être sur des domaines différents en
  // production) plutôt que de matcher tout chemin `/api/` sans distinction.
  const apiOrigin = new URL(env.VITE_API_URL ?? 'http://localhost:4000/api').origin;

  // ⚠️ Workbox sérialise `urlPattern` en appelant `.toString()` sur la
  // valeur fournie pour l'inliner tel quel dans le service worker généré.
  // Une fonction fléchée fermant sur `apiOrigin` (variable Node, connue
  // uniquement au moment du build) perdrait cette fermeture une fois
  // sérialisée : le code généré référencerait une variable `apiOrigin`
  // inexistante dans le service worker final, provoquant une erreur
  // silencieuse à l'exécution. Une RegExp, elle, est intégralement
  // autoportante une fois sérialisée (`/pattern/flags`) — c'est donc la
  // forme à utiliser ici pour "figer" une valeur calculée au build.
  const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiCachePattern = new RegExp(`^${escapeRegExp(apiOrigin)}/api/(?!auth/)`);

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Vola — Gestionnaire de dépenses',
          short_name: 'Vola',
          description: 'Suivez votre budget simplement, gratuitement, même hors ligne.',
          theme_color: '#10945b',
          background_color: '#0a0b0a',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          // Les chunks d'export (jsPDF, ExcelJS) sont volumineux mais
          // chargés à la demande uniquement (voir ExportModal.tsx) — et
          // l'export nécessite de toute façon une connexion pour récupérer
          // des données fraîches. Les précacher gonflerait inutilement le
          // téléchargement initial de l'app sans bénéfice réel hors ligne.
          // `html2canvas`/`purify.es`/`index.es` sont des dépendances de
          // la fonctionnalité `.html()` de jsPDF, jamais appelée ici
          // (seul `autoTable` est utilisé) — on les exclut également.
          globIgnores: [
            '**/export-pdf-*.js',
            '**/export-excel-*.js',
            '**/html2canvas-*.js',
            '**/purify.es-*.js',
            '**/index.es-*.js',
          ],
          runtimeCaching: [
            {
              // GET uniquement : les POST/PATCH/DELETE ne doivent jamais
              // être interceptés par le service worker — c'est notre
              // propre file d'attente (Dexie) qui gère leur cas hors
              // ligne, pas Workbox. `/api/auth/*` est explicitement exclu
              // par prudence (ne jamais mettre en cache des réponses
              // liées à l'authentification).
              urlPattern: apiCachePattern,
              method: 'GET',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
          ],
        },
        devOptions: {
          // Permet de tester le service worker directement en `pnpm dev`
          // (sinon actif uniquement sur un build de production).
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
  };
});
