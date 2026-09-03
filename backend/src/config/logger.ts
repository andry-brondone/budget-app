import pino from 'pino';
import { env } from './env.js';

const baseOptions: pino.LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
};

// Avec `exactOptionalPropertyTypes`, on ne doit pas assigner `transport:
// undefined` explicitement — on construit l'objet conditionnellement.
export const logger =
  env.NODE_ENV !== 'production'
    ? pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      })
    : pino(baseOptions);
