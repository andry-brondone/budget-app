import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { get, remove, upsert } from './overall-budget.controller.js';

export const overallBudgetRouter = Router();

overallBudgetRouter.use(requireAuth);

overallBudgetRouter.get('/', get);
// PUT plutôt que POST/PATCH séparés : un seul objectif existe par
// utilisateur et par mois (contrainte unique en base), l'opération est
// donc naturellement un upsert idempotent.
overallBudgetRouter.put('/', upsert);
overallBudgetRouter.delete('/', remove);
