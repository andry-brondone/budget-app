import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { create, getOne, list, remove, update } from './transactions.controller.js';

export const transactionsRouter = Router();

// Toutes les routes de ce module nécessitent une session active.
transactionsRouter.use(requireAuth);

transactionsRouter.get('/', list);
transactionsRouter.post('/', create);
transactionsRouter.get('/:id', getOne);
transactionsRouter.patch('/:id', update);
transactionsRouter.delete('/:id', remove);
