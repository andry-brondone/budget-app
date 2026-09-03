import { create } from 'zustand';
import type { AuthUser } from '@/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

/**
 * Stockage volontairement en mémoire uniquement (pas de persist/
 * localStorage) : l'access token ne doit jamais être accessible à un
 * script tiers via XSS. La session est restaurée au chargement via
 * le refresh token (cookie httpOnly) — voir hooks/useAuth.ts.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => {
    set({ user, accessToken });
  },
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearSession: () => {
    set({ user: null, accessToken: null });
  },
}));
