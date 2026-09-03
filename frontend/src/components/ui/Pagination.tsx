import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="ghost"
        className="w-auto px-3"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        className="w-auto px-3"
        disabled={page >= totalPages}
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};
