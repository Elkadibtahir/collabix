import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { type CalendarView } from './CalendarTypes';
import { IconButton } from '../ui/IconButton';

interface CalendarControlsProps {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  currentLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

const views: { id: CalendarView; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
  { id: 'agenda', label: 'Agenda' },
];

export function CalendarControls({ view, onViewChange, currentLabel, onPrev, onNext }: CalendarControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewChange(v.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-caption font-medium transition-all duration-150',
              view === v.id
                ? 'bg-accent-600 text-white shadow-cx-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <IconButton label="Previous" variant="ghost" size="sm" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </IconButton>
        <p className="text-section font-semibold text-text-primary min-w-[180px] text-center">{currentLabel}</p>
        <IconButton label="Next" variant="ghost" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
