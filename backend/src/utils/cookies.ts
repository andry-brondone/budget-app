import type { Request } from 'express';

/**
 * Point d'accès unique et typé aux cookies de la requête.
 * cookie-parser type `req.cookies` en `any` : on isole ici le seul
 * endroit du code qui doit "faire confiance" à cette forme.
 */
export const getCookie = (req: Request, name: string): string | undefined => {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  return cookies?.[name];
};
