import { cn } from '../../lib/cn';
import { eventCategoryConfig, type CalendarEvent } from './CalendarTypes';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onSelect: (e: CalendarEvent) => void;
  compact?: boolean;
}

export function CalendarEventCard({ event, onSelect, compact }: CalendarEventCardProps) {
  const cfg = eventCategoryConfig[event.category];

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      aria-label={`Event: ${event.title}`}
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border-subtle bg-elevated p-3 sm:p-4 text-left w-full transition-all duration-150 hover:shadow-cx-sm',
        !compact && 'hover:-translate-y-0.5',
      )}
    >
      <span className={cn('h-full w-1 shrink-0 rounded-full', cfg.color.split(' ')[2] || 'bg-accent-500')} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('font-semibold text-text-primary truncate', compact ? 'text-caption' : 'text-body')}>{event.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
          {event.startTime && (
            <span className="text-2xs text-text-tertiary">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
          )}
          <span className={cn('text-2xs font-medium', cfg.color.split(' ')[1] || 'text-text-tertiary')}>{cfg.label}</span>
        </div>
        {!compact && event.participants && event.participants.length > 0 && (
          <p className="text-2xs text-text-tertiary mt-1">
            {event.participants.join(', ')}
          </p>
        )}
        {!compact && (event.workspace || event.project) && (
          <p className="text-2xs text-text-tertiary mt-0.5">
            {[event.workspace, event.project].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {event.priority === 'high' && (
        <span className="shrink-0 mt-0.5 flex h-2 w-2 rounded-full bg-danger-500" />
      )}
    </button>
  );
}
