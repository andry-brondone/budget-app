import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { categoryBreakdown, monthlySummary } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/category-breakdown', categoryBreakdown);
dashboardRouter.get('/monthly-summary', monthlySummary);
