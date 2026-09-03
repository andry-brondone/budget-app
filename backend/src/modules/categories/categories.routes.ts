import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { create, list, remove, update } from './categories.controller.js';

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get('/', list);
categoriesRouter.post('/', create);
categoriesRouter.patch('/:id', update);
categoriesRouter.delete('/:id', remove);
