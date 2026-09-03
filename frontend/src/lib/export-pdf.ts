import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatAriary } from '@/lib/format-money';
import { getMonthLabel } from '@/lib/date-labels';
import { formatDateShort } from '@/lib/format-date';
import type { MonthlyRecapData } from '@/lib/fetch-monthly-recap';
import type { AuthUser } from '@/types/auth.types';

const BRAND_COLOR: [number, number, number] = [16, 148, 91];

export const exportMonthlyRecapToPdf = (data: MonthlyRecapData, user: AuthUser | null): void => {
  const doc = new jsPDF();
  const monthLabel = `${getMonthLabel(data.month)} ${String(data.year)}`;
  const sortedTransactions = [...data.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  doc.setFontSize(18);
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Vola', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor('#334155');
  doc.text(`Récapitulatif mensuel — ${monthLabel}`, 14, 26);
  if (user?.name) {
    doc.text(user.name, 14, 32);
  }

  autoTable(doc, {
    startY: 40,
    head: [['Solde', 'Revenus', 'Dépenses']],
    body: [
      [
        formatAriary(data.totals.balance),
        formatAriary(data.totals.totalIncome),
        formatAriary(data.totals.totalExpense),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR },
  });

  let cursorY = (doc.lastAutoTable?.finalY ?? 40) + 10;

  if (data.budgets.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor('#334155');
    doc.text('Budgets', 14, cursorY);

    autoTable(doc, {
      startY: cursorY + 4,
      head: [['Catégorie', 'Budget', 'Dépensé', 'Restant', '%']],
      body: data.budgets.map((budget) => [
        budget.category.name,
        formatAriary(budget.amount),
        formatAriary(budget.spent),
        formatAriary(budget.remaining),
        `${String(budget.percentage)}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: BRAND_COLOR },
      styles: { fontSize: 9 },
    });

    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 10;
  }

  doc.setFontSize(12);
  doc.setTextColor('#334155');
  doc.text('Transactions', 14, cursorY);

  autoTable(doc, {
    startY: cursorY + 4,
    head: [['Date', 'Type', 'Catégorie', 'Note', 'Montant']],
    body: sortedTransactions.map((transaction) => [
      formatDateShort(transaction.date),
      transaction.type === 'INCOME' ? 'Revenu' : 'Dépense',
      transaction.category?.name ?? '—',
      transaction.description ?? '',
      `${transaction.type === 'INCOME' ? '+' : '-'}${formatAriary(transaction.amount)}`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: BRAND_COLOR },
    styles: { fontSize: 9 },
  });

  doc.save(`vola-recap-${String(data.year)}-${String(data.month).padStart(2, '0')}.pdf`);
};
