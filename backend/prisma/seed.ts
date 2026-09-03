import 'dotenv/config';
import { prisma } from '../src/config/db.js';
import type { TransactionType } from '../src/config/prisma-client.js';

interface DefaultCategory {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

// Catégories par défaut adaptées au contexte malgache (JIRAMA, taxi-be,
// Mobile Money...). Partagées par tous les utilisateurs (userId: null),
// non modifiables/supprimables depuis l'application.
const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Nourriture', type: 'EXPENSE', icon: 'UtensilsCrossed', color: '#f97316' },
  { name: 'Transport', type: 'EXPENSE', icon: 'Car', color: '#3b82f6' },
  { name: 'Logement', type: 'EXPENSE', icon: 'Home', color: '#8b5cf6' },
  { name: 'JIRAMA (Eau & Électricité)', type: 'EXPENSE', icon: 'Zap', color: '#eab308' },
  { name: 'Mobile Money (frais)', type: 'EXPENSE', icon: 'Smartphone', color: '#06b6d4' },
  { name: 'Communication', type: 'EXPENSE', icon: 'Wifi', color: '#0ea5e9' },
  { name: 'Santé', type: 'EXPENSE', icon: 'HeartPulse', color: '#ef4444' },
  { name: 'Éducation', type: 'EXPENSE', icon: 'GraduationCap', color: '#6366f1' },
  { name: 'Épargne', type: 'EXPENSE', icon: 'PiggyBank', color: '#10945b' },
  { name: 'Autres dépenses', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#64748b' },
  { name: 'Salaire', type: 'INCOME', icon: 'Wallet', color: '#22c55e' },
  { name: 'Freelance', type: 'INCOME', icon: 'Briefcase', color: '#14b8a6' },
  { name: 'Aide familiale', type: 'INCOME', icon: 'HandCoins', color: '#84cc16' },
  { name: 'Autres revenus', type: 'INCOME', icon: 'MoreHorizontal', color: '#64748b' },
];

const run = async (): Promise<void> => {
  for (const category of DEFAULT_CATEGORIES) {
    // Idempotent : on vérifie l'existence avant de créer, pour pouvoir
    // relancer ce script sans jamais créer de doublons (voir la note sur
    // les contraintes UNIQUE + NULL dans schema.prisma).
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name, type: category.type },
    });

    if (existing) {
      console.log(`↷ "${category.name}" (${category.type}) existe déjà, ignorée.`);
      continue;
    }

    await prisma.category.create({ data: { ...category, userId: null } });
    console.log(`✓ "${category.name}" (${category.type}) créée.`);
  }
};

run()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
