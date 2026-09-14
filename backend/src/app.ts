import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { budgetsRouter } from './modules/budgets/budgets.routes.js';
import { overallBudgetRouter } from './modules/overall-budget/overall-budget.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/budgets', budgetsRouter);
  app.use('/api/overall-budget', overallBudgetRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
