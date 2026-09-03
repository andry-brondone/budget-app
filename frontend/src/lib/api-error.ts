interface ApiErrorShape {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

const isApiErrorShape = (error: unknown): error is ApiErrorShape =>
  typeof error === 'object' && error !== null && 'response' in error;

/**
 * Extrait un message d'erreur lisible depuis une erreur Axios provenant
 * de l'API (format `{ error: { code, message } }`, voir backend
 * middlewares/error-handler.ts). Utilisé par tous les hooks de mutation.
 */
export const extractErrorMessage = (error: unknown): string => {
  if (isApiErrorShape(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === 'string') return message;
  }
  return 'Une erreur inattendue est survenue';
};
