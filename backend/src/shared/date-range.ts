/** Bornes [début, fin exclusive) d'un mois donné, en UTC. `month` est
 * 1-indexé (1=janvier) ; `Date.UTC` gère nativement le débordement
 * d'année pour décembre (month=12 -> le mois suivant tombe en janvier
 * N+1). Utilisé par les modules budgets et dashboard. */
export const getMonthDateRange = (month: number, year: number): { start: Date; end: Date } => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 1)),
});
