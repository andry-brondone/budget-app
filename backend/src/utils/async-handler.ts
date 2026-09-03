import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler<Req extends Request = Request, Res extends Response = Response> = (
  req: Req,
  res: Res,
  next: NextFunction,
) => Promise<void>;

/**
 * Évite le try/catch répété dans chaque controller : toute rejection
 * de promesse est transmise à `next()` et donc au middleware d'erreur.
 */
export const asyncHandler = <Req extends Request = Request, Res extends Response = Response>(
  handler: AsyncRouteHandler<Req, Res>,
) => {
  return (req: Req, res: Res, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
};
