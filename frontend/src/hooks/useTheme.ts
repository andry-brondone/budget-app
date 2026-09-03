import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vola-theme';

const getPreferredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage indisponible (navigation privée stricte) : on retombe
    // sur la préférence système.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
}

/** Le thème initial est déjà appliqué avant le premier paint par le
 * script inline dans index.html (anti-flash) ; ce hook ne fait que
 * synchroniser l'état React avec le DOM et gérer les changements
 * ultérieurs (bascule utilisateur, persistance). */
export const useTheme = (): UseThemeResult => {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Échec silencieux : la préférence ne sera simplement pas retenue
      // à la prochaine visite.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
};
