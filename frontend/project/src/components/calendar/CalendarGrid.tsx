import { useMemo } from 'react';
import { cn } from '../../lib/cn';
import { weekDays, type CalendarEvent, type CalendarView } from './CalendarTypes';

interface CalendarGridProps {
  view: CalendarView;
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function CalendarGrid({ view, currentDate, events, onSelectEvent, onDateClick }: CalendarGridProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const existing = map.get(e.date) || [];
      existing.push(e);
      map.set(e.date, existing);
    });
    return map;
  }, [events]);

  if (view === 'agenda') return null;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentYear, currentMonth, i + 1);
    const dateStr = date.toISOString().slice(0, 10);
    const dayEvents = eventsByDate.get(dateStr) || [];
    return { day: i + 1, dateStr, events: dayEvents, isToday: dateStr === todayStr };
  });

  if (view === 'month') {
    return (
      <div className="rounded-xl border border-border-subtle bg-elevated overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border-subtle">
          {weekDays.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-2xs font-semibold uppercase tracking-wider text-text-tertiary bg-surface">
              <span className="hidden sm:block">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startDay }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[120px] border-b border-r border-border-subtle bg-surface-1/30" />
          ))}
          {days.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => onDateClick?.(new Date(currentYear, currentMonth, d.day))}
              className={cn(
                'min-h-[100px] sm:min-h-[120px] border-b border-r border-border-subtle p-1.5 text-left transition-colors hover:bg-surface-1',
                d.isToday && 'bg-accent-50/30 dark:bg-accent-100/10',
              )}
            >
              <span className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-caption font-medium',
                d.isToday ? 'bg-accent-600 text-white' : 'text-text-secondary',
              )}>
                {d.day}
              </span>
              <div className="mt-1 space-y-0.5">
                {d.events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onSelectEvent(ev); }}
                    className="truncate rounded px-1 py-0.5 text-2xs font-medium cursor-pointer"
                  >
                    <span className={cn(
                      'inline-flex items-center gap-1 w-full rounded px-1 py-0.5',
                      ev.priority === 'high' ? 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-300' :
                      ev.priority === 'medium' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-300' :
                      'bg-surface-2 text-text-secondary',
                    )}>
                      {ev.startTime && <span>{ev.startTime}</span>}
                      <span className="truncate">{ev.title}</span>
                    </span>
                  </div>
                ))}
                {d.events.length > 3 && (
                  <p className="text-2xs text-text-tertiary pl-1">+{d.events.length - 3} more</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-elevated p-4">
      <p className="text-body text-text-secondary">Switch to Month or Agenda view for the best experience.</p>
    </div>
  );
}
