import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Formate une date ISO en format court lisible, ex: "20 août 2026". */
export const formatDateShort = (isoDate: string): string =>
  format(parseISO(isoDate), 'd MMM yyyy', { locale: fr });

/** Convertit une date ISO en valeur compatible avec `<input type="date">`. */
export const toDateInputValue = (isoDate: string): string => isoDate.slice(0, 10);
