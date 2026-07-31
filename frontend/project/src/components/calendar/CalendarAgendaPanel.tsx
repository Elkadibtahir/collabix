import { useMemo } from 'react';
import { CalendarDays, AlertTriangle, Target } from 'lucide-react';
import { CalendarEventCard } from './CalendarEventCard';
import { type CalendarEvent } from './CalendarTypes';

interface CalendarAgendaPanelProps {
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}

export function CalendarAgendaPanel({ events, onSelectEvent }: CalendarAgendaPanelProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { today, thisWeek, overdue, upcoming } = useMemo(() => {
    const todayEvents = events.filter((e) => e.date === todayStr);
    const thisWeekEvents = events.filter((e) => e.date > todayStr && e.date <= getWeekEnd(todayStr));
    const overdueEvents = events.filter((e) => e.date < todayStr && !e.completed);
    const upcomingEvents = events.filter((e) => e.date > getWeekEnd(todayStr));
    return { today: todayEvents, thisWeek: thisWeekEvents, overdue: overdueEvents, upcoming: upcomingEvents };
  }, [events, todayStr]);

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-text-tertiary" />
          <h3 className="text-caption font-semibold text-text-primary">Today</h3>
          <span className="text-2xs text-text-tertiary">({today.length})</span>
        </div>
        {today.length === 0 ? (
          <p className="text-caption text-text-tertiary">No events scheduled for today.</p>
        ) : (
          <div className="space-y-2">{today.map((e) => <CalendarEventCard key={e.id} event={e} onSelect={onSelectEvent} compact />)}</div>
        )}
      </section>

      {overdue.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-danger-500" />
            <h3 className="text-caption font-semibold text-danger-500">Overdue</h3>
            <span className="text-2xs text-text-tertiary">({overdue.length})</span>
          </div>
          <div className="space-y-2">{overdue.map((e) => <CalendarEventCard key={e.id} event={e} onSelect={onSelectEvent} compact />)}</div>
        </section>
      )}

      {thisWeek.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-text-tertiary" />
            <h3 className="text-caption font-semibold text-text-primary">This Week</h3>
            <span className="text-2xs text-text-tertiary">({thisWeek.length})</span>
          </div>
          <div className="space-y-2">{thisWeek.map((e) => <CalendarEventCard key={e.id} event={e} onSelect={onSelectEvent} compact />)}</div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-text-tertiary" />
            <h3 className="text-caption font-semibold text-text-primary">Upcoming</h3>
            <span className="text-2xs text-text-tertiary">({upcoming.length})</span>
          </div>
          <div className="space-y-2">{upcoming.map((e) => <CalendarEventCard key={e.id} event={e} onSelect={onSelectEvent} compact />)}</div>
        </section>
      )}

      {today.length === 0 && thisWeek.length === 0 && overdue.length === 0 && upcoming.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center">
          <CalendarDays className="h-8 w-8 text-text-tertiary mb-2" />
          <p className="text-body font-medium text-text-secondary">No upcoming events</p>
          <p className="text-caption text-text-tertiary mt-0.5">Events will appear here as they are scheduled.</p>
        </div>
      )}
    </div>
  );
}

function getWeekEnd(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + (6 - d.getDay()));
  return d.toISOString().slice(0, 10);
}
