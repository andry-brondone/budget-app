import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Target } from 'lucide-react';
import {
  useDeleteOverallBudget,
  useOverallBudgetQuery,
  useUpsertOverallBudget,
} from '@/hooks/useOverallBudget';
import { formatAriary } from '@/lib/format-money';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

// Dimensions de l'anneau SVG. Le rayon détermine la circonférence, donc
// la longueur totale du trait à faire varier pour représenter la
// progression (technique du "stroke-dasharray" pour un anneau de
// chargement en SVG pur, sans dépendance graphique supplémentaire —
// une seule valeur ne justifie pas l'usage de Chart.js).
const RING_RADIUS = 72;
const RING_STROKE_WIDTH = 14;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_SIZE = 2 * (RING_RADIUS + RING_STROKE_WIDTH);

interface Period {
  month: number;
  year: number;
}

const getCurrentPeriod = (): Period => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const getRingStrokeClass = (percentage: number): string => {
  if (percentage >= 100) return 'stroke-rose-500';
  if (percentage >= 80) return 'stroke-amber-500';
  return 'stroke-brand-500 dark:stroke-brand-400';
};

/**
 * Objectif de dépenses mensuel global, distinct des budgets par
 * catégorie (voir components/budgets/BudgetSection.tsx). Affiché en
 * évidence sur le tableau de bord, toujours pour le mois en cours — la
 * navigation vers d'autres mois relève de la page Statistiques.
 */
export const OverallBudgetRing = () => {
  const period = getCurrentPeriod();
  const { data, isLoading } = useOverallBudgetQuery(period.month, period.year);
  const upsertOverallBudget = useUpsertOverallBudget();
  const deleteOverallBudget = useDeleteOverallBudget();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleStartEdit = (): void => {
    setAmountInput(data?.amount ? String(data.amount) : '');
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSave = (): void => {
    const parsedAmount = Number(amountInput);
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) return;

    upsertOverallBudget.mutate(
      { month: period.month, year: period.year, amount: parsedAmount },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = (): void => {
    setIsMenuOpen(false);
    if (window.confirm("Supprimer l'objectif mensuel ?")) {
      deleteOverallBudget.mutate({ month: period.month, year: period.year });
    }
  };

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Spinner className="h-6 w-6" />
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Objectif de dépenses mensuel
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Ex: 500000"
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value);
            }}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            className="w-auto px-4"
            isLoading={upsertOverallBudget.isPending}
            onClick={handleSave}
          >
            Enregistrer
          </Button>
        </div>
      </Card>
    );
  }

  if (data?.amount === null || data?.amount === undefined) {
    return (
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400">
          <Target size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Aucun objectif mensuel défini
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Définis un plafond global de dépenses pour le mois en cours.
          </p>
        </div>
        <Button type="button" className="w-auto px-4" onClick={handleStartEdit}>
          Définir un objectif
        </Button>
      </Card>
    );
  }

  const percentage = data.percentage ?? 0;
  const clampedPercentage = Math.min(percentage, 100);
  const dashOffset = RING_CIRCUMFERENCE - (clampedPercentage / 100) * RING_CIRCUMFERENCE;
  const remaining = data.remaining ?? 0;
  const isOverBudget = remaining < 0;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Objectif mensuel</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatAriary(data.amount)}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label="Options de l'objectif mensuel"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-700 dark:hover:text-slate-300"
          >
            <MoreVertical size={18} />
          </button>
          {isMenuOpen ? (
            <div className="animate-scale-in absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg dark:border-ink-700 dark:bg-ink-800">
              <button
                type="button"
                onClick={handleStartEdit}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-ink-700"
              >
                Modifier l&rsquo;objectif
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="block w-full px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-ink-700"
              >
                Supprimer l&rsquo;objectif
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              strokeWidth={RING_STROKE_WIDTH}
              className="fill-none stroke-slate-100 dark:stroke-ink-700"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              strokeWidth={RING_STROKE_WIDTH}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={cn('fill-none transition-all duration-500', getRingStrokeClass(percentage))}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatAriary(data.spent)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Dépenses totales</span>
          </div>
        </div>

        <p
          className={cn(
            'text-sm font-medium',
            isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300',
          )}
        >
          {isOverBudget
            ? `Objectif dépassé de ${formatAriary(Math.abs(remaining))}`
            : `Reste à dépenser : ${formatAriary(remaining)}`}
        </p>
      </div>
    </Card>
  );
};
