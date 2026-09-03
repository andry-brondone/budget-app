import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

// Enregistrement centralisé et unique des éléments Chart.js utilisés par
// l'application (Chart.js v4 est tree-shakeable : chaque type de
// graphique doit déclarer explicitement ce dont il a besoin). Ce module
// est importé une seule fois, en effet de bord, depuis main.tsx.
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);
