import ExcelJS from 'exceljs';
import { getMonthLabel } from '@/lib/date-labels';
import { formatDateShort } from '@/lib/format-date';
import type { MonthlyRecapData } from '@/lib/fetch-monthly-recap';
import type { AuthUser } from '@/types/auth.types';

const AMOUNT_FORMAT = '#,##0 "Ar"';

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMonthlyRecapToExcel = async (
  data: MonthlyRecapData,
  user: AuthUser | null,
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Vola';
  workbook.created = new Date();

  const monthLabel = `${getMonthLabel(data.month)} ${String(data.year)}`;

  // Feuille Résumé
  const summarySheet = workbook.addWorksheet('Résumé');
  summarySheet.columns = [
    { header: 'Indicateur', key: 'label', width: 24 },
    { header: 'Valeur', key: 'value', width: 24 },
  ];
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.addRow({ label: 'Récapitulatif', value: monthLabel });
  if (user?.name) {
    summarySheet.addRow({ label: 'Utilisateur', value: user.name });
  }
  summarySheet.addRow({ label: 'Solde', value: data.totals.balance });
  summarySheet.addRow({ label: 'Revenus', value: data.totals.totalIncome });
  summarySheet.addRow({ label: 'Dépenses', value: data.totals.totalExpense });

  // Feuille Budgets (si présents)
  if (data.budgets.length > 0) {
    const budgetSheet = workbook.addWorksheet('Budgets');
    budgetSheet.columns = [
      { header: 'Catégorie', key: 'category', width: 24 },
      { header: 'Budget', key: 'amount', width: 16 },
      { header: 'Dépensé', key: 'spent', width: 16 },
      { header: 'Restant', key: 'remaining', width: 16 },
      { header: '%', key: 'percentage', width: 10 },
    ];
    budgetSheet.getRow(1).font = { bold: true };

    for (const budget of data.budgets) {
      budgetSheet.addRow({
        category: budget.category.name,
        amount: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        percentage: budget.percentage,
      });
    }

    budgetSheet.getColumn('amount').numFmt = AMOUNT_FORMAT;
    budgetSheet.getColumn('spent').numFmt = AMOUNT_FORMAT;
    budgetSheet.getColumn('remaining').numFmt = AMOUNT_FORMAT;
  }

  // Feuille Transactions
  const transactionsSheet = workbook.addWorksheet('Transactions');
  transactionsSheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Catégorie', key: 'category', width: 20 },
    { header: 'Note', key: 'description', width: 32 },
    { header: 'Montant', key: 'amount', width: 16 },
  ];
  transactionsSheet.getRow(1).font = { bold: true };

  const sortedTransactions = [...data.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (const transaction of sortedTransactions) {
    transactionsSheet.addRow({
      date: formatDateShort(transaction.date),
      type: transaction.type === 'INCOME' ? 'Revenu' : 'Dépense',
      category: transaction.category?.name ?? '—',
      description: transaction.description ?? '',
      amount: transaction.type === 'INCOME' ? transaction.amount : -transaction.amount,
    });
  }

  transactionsSheet.getColumn('amount').numFmt = AMOUNT_FORMAT;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, `vola-recap-${String(data.year)}-${String(data.month).padStart(2, '0')}.xlsx`);
};
