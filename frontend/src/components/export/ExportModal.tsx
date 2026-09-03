import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMonthlyRecap } from '@/lib/fetch-monthly-recap';
import { useCurrentUser } from '@/hooks/useAuth';
import { getMonthLabel } from '@/lib/date-labels';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

interface ExportModalProps {
  onClose: () => void;
}

interface MonthOption {
  month: number;
  year: number;
  label: string;
}

/** Les 12 derniers mois (dont le mois en cours), du plus récent au plus
 * ancien, pour le sélecteur. */
const buildMonthOptions = (): MonthOption[] => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const options: MonthOption[] = [];

  for (let offset = 0; offset < 12; offset += 1) {
    let month = currentMonth - offset;
    let year = currentYear;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }
    options.push({ month, year, label: `${getMonthLabel(month)} ${String(year)}` });
  }

  return options;
};

const monthOptions = buildMonthOptions();

export const ExportModal = ({ onClose }: ExportModalProps) => {
  const user = useCurrentUser();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel'): Promise<void> => {
    const selectedPeriod = monthOptions[selectedIndex];
    if (!selectedPeriod) return;

    setIsExporting(true);
    try {
      const data = await fetchMonthlyRecap(selectedPeriod.month, selectedPeriod.year);

      if (data.transactions.length === 0) {
        toast.info('Aucune transaction pour cette période, rien à exporter');
        return;
      }

      // Import dynamique : jsPDF (avec autoTable) et ExcelJS sont des
      // librairies lourdes qui ne doivent pas alourdir le bundle
      // principal précaché par le service worker (voir vite.config.ts) —
      // elles ne se chargent qu'au moment où l'utilisateur exporte
      // réellement, dans un chunk séparé.
      if (format === 'pdf') {
        const { exportMonthlyRecapToPdf } = await import('@/lib/export-pdf');
        exportMonthlyRecapToPdf(data, user);
      } else {
        const { exportMonthlyRecapToExcel } = await import('@/lib/export-excel');
        await exportMonthlyRecapToExcel(data, user);
      }

      toast.success('Export généré');
      onClose();
    } catch {
      toast.error("Échec de l'export, réessaie");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="export-period">Mois à exporter</Label>
        <Select
          id="export-period"
          value={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(Number(event.target.value));
          }}
        >
          {monthOptions.map((option, index) => (
            <option key={`${String(option.year)}-${String(option.month)}`} value={index}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          isLoading={isExporting}
          onClick={() => void handleExport('pdf')}
        >
          <span className="flex items-center justify-center gap-1.5">
            <FileText size={16} />
            PDF
          </span>
        </Button>
        <Button type="button" isLoading={isExporting} onClick={() => void handleExport('excel')}>
          <span className="flex items-center justify-center gap-1.5">
            <FileSpreadsheet size={16} />
            Excel
          </span>
        </Button>
      </div>
    </div>
  );
};
