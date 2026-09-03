import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { create, list, remove, update } from './budgets.controller.js';

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

budgetsRouter.get('/', list);
budgetsRouter.post('/', create);
budgetsRouter.patch('/:id', update);
budgetsRouter.delete('/:id', remove);
