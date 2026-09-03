import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/db.js';
import { scheduleMonthlyBudgetRollover } from './jobs/monthly-budget-rollover.job.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Serveur démarré sur http://localhost:${String(env.PORT)}`);
});

scheduleMonthlyBudgetRollover();

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} reçu, arrêt en cours...`);
  server.close(() => {
    logger.info('Serveur HTTP fermé');
  });
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
