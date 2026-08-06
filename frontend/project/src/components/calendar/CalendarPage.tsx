import { useState, useCallback } from 'react';
import { Calendar, SearchX } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarControls } from './CalendarControls';
import { CalendarGrid } from './CalendarGrid';
import { CalendarAgendaPanel } from './CalendarAgendaPanel';
import { CalendarEventDrawer } from './CalendarEventDrawer';
import { calendarFilters, type CalendarView, type CalendarFilter, type CalendarEvent } from './CalendarTypes';
import { AIEmptyState } from '../ai/AIEmptyState';
import { cn } from '../../lib/cn';

type PageState = 'loading' | 'error' | 'ready';

function getMonthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CalendarPage() {
  const [state, setState] = useState<PageState>('ready');
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigatePrev = useCallback(() => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }, [currentDate, view]);

  const navigateNext = useCallback(() => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }, [currentDate, view]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleSelectEvent = useCallback((e: CalendarEvent) => {
    setSelectedEvent(e);
    setDrawerOpen(true);
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3"><div aria-hidden="true" className="h-10 w-10 rounded-xl bg-surface-2 animate-shimmer" /><div className="space-y-1.5"><div aria-hidden="true" className="h-5 w-48 bg-surface-2 animate-shimmer rounded" /><div aria-hidden="true" className="h-4 w-64 bg-surface-2 animate-shimmer rounded" /></div></div>
        <div className="flex gap-2"><div aria-hidden="true" className="h-8 w-20 rounded-lg bg-surface-2 animate-shimmer" /><div aria-hidden="true" className="h-8 w-20 rounded-lg bg-surface-2 animate-shimmer" /></div>
        <div className="rounded-xl border border-border-subtle bg-elevated p-4">
          <div className="grid grid-cols-7 gap-2">{Array.from({ length: 35 }, (_, i) => (<div key={i} aria-hidden="true" className="h-24 rounded-lg bg-surface-2 animate-shimmer" />))}</div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10"><Calendar className="h-6 w-6" /></div>
        <h3 className="text-section font-semibold text-text-primary">Unable to load calendar</h3>
        <p className="mt-1 max-w-sm text-body text-text-tertiary text-center">Something went wrong. Please try again.</p>
        <button type="button" onClick={() => setState('loading')} className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-body font-medium text-white hover:bg-accent-700 transition-colors">Retry</button>
      </div>
    );
  }

  const currentLabel = view === 'month' ? getMonthLabel(currentDate) : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredEvents = activeFilter === 'all' ? [] : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1440px] mx-auto">
      <CalendarHeader onCreateEvent={() => {}} onToday={goToday} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <CalendarControls view={view} onViewChange={setView} currentLabel={currentLabel} onPrev={navigatePrev} onNext={navigateNext} />

          <div className="flex flex-wrap items-center gap-2">
            {calendarFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-2xs font-medium transition-all duration-150 border',
                  activeFilter === f.id
                    ? 'bg-accent-600 text-white border-accent-600'
                    : 'bg-surface text-text-secondary border-border-subtle hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {view === 'agenda' ? (
            <CalendarAgendaPanel events={filteredEvents} onSelectEvent={handleSelectEvent} />
          ) : filteredEvents.length === 0 ? (
            <div className="py-12">
              <AIEmptyState icon={<SearchX className="h-6 w-6" />} title="No Events Found" description="No events match the selected filters." />
            </div>
          ) : (
            <CalendarGrid view={view} currentDate={currentDate} events={filteredEvents} onSelectEvent={handleSelectEvent} />
          )}
        </div>

        <div className="lg:w-80 shrink-0">
          <CalendarAgendaPanel events={filteredEvents} onSelectEvent={handleSelectEvent} />
        </div>
      </div>

      <CalendarEventDrawer event={selectedEvent} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
