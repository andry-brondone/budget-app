/**
 * Formate un montant en Ariary avec séparateurs de milliers.
 * On évite `Intl.NumberFormat(..., { style: 'currency', currency: 'MGA' })`
 * car le rendu du symbole MGA est peu fiable selon les navigateurs —
 * un simple suffixe "Ar" est plus prévisible et plus lisible localement.
 */
export const formatAriary = (amount: number): string => `${new Intl.NumberFormat('fr-FR').format(amount)} Ar`;
