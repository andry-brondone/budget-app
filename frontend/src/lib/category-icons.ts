import {
  Briefcase,
  Car,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Home,
  MoreHorizontal,
  PiggyBank,
  Smartphone,
  Tag,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Doit rester synchronisé avec les icônes utilisées dans
// backend/prisma/seed.ts pour les catégories par défaut.
const ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Smartphone,
  Wifi,
  HeartPulse,
  GraduationCap,
  PiggyBank,
  MoreHorizontal,
  Wallet,
  Briefcase,
  HandCoins,
};

/** Retourne l'icône lucide-react correspondant au nom stocké, ou une
 * icône générique ("Tag") pour les catégories personnalisées sans icône. */
export const getCategoryIcon = (iconName: string | null): LucideIcon =>
  iconName ? (ICONS[iconName] ?? Tag) : Tag;

const PALETTE = ['#10945b', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#14b8a6', '#eab308', '#ec4899'];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/** Retourne la couleur stockée, ou une couleur déterministe (dérivée du
 * nom) pour les catégories personnalisées sans couleur — évite de devoir
 * demander un code hexadécimal à l'utilisateur tout en gardant un rendu
 * visuel varié et cohérent. */
export const getCategoryColor = (color: string | null, name: string): string => {
  if (color) return color;
  const index = hashString(name) % PALETTE.length;
  return PALETTE[index] ?? '#64748b';
};
