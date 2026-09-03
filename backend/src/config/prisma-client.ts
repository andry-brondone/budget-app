// Prisma 7 génère le client dans un dossier personnalisé
// (src/generated/prisma-client, voir generator.output dans
// prisma/schema.prisma) plutôt que dans node_modules. Centraliser le
// point d'import ici évite de répéter un chemin relatif fragile
// (`../../../generated/prisma-client/client.js`) dans chaque module —
// seul ce fichier connaît la profondeur réelle du dossier généré.
export { PrismaClient } from '../generated/prisma-client/client.js';
export type {
  User,
  RefreshToken,
  Category,
  Transaction,
  Budget,
  TransactionType,
  Prisma,
} from '../generated/prisma-client/client.js';
