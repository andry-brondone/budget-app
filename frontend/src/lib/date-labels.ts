const MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const MONTH_LABELS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/** `month` est 1-indexé (1=janvier). */
export const getMonthLabel = (month: number): string => MONTH_LABELS[month - 1] ?? '';

export const getMonthLabelShort = (month: number): string => MONTH_LABELS_SHORT[month - 1] ?? '';
