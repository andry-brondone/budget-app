// jspdf-autotable type ses paramètres en interne comme `any`
// (`export type jsPDFDocument = any` dans ses propres .d.ts) et n'étend
// jamais formellement l'interface `jsPDF` du paquet `jspdf`, alors même
// que c'est le comportement runtime documenté (le plugin attache
// `lastAutoTable` à l'instance après chaque appel). On comble ce trou de
// typage ici plutôt que de recourir à un cast `any` au point d'usage.
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}
