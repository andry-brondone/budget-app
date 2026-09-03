# Vola — Gestionnaire de dépenses personnelles

MVP d'un gestionnaire de budget pensé pour un usage à Madagascar : léger,
gratuit, mobile-first, en Ariary (MGA), avec des catégories de dépenses
locales (JIRAMA, taxi-be, Mobile Money, etc.).

## Stack

- **Frontend** : React 19 + Vite + TypeScript (strict) + Tailwind CSS v4 + React Query + Zustand + React Hook Form + Zod
- **Backend** : Node.js + Express + TypeScript (strict) + Prisma + PostgreSQL
- **Auth** : JWT access token (15 min, mémoire) + refresh token opaque en cookie httpOnly (rotation à chaque usage)
