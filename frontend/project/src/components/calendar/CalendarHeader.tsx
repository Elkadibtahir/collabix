import { Calendar, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface CalendarHeaderProps {
  onCreateEvent: () => void;
  onToday: () => void;
}

export function CalendarHeader({ onCreateEvent, onToday }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
          <Calendar className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-page font-bold text-text-primary tracking-tight">Enterprise Calendar</h1>
          <p className="text-caption text-text-tertiary mt-0.5">Manage deadlines, meetings and important organizational events.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onToday}>Today</Button>
        <Button size="sm" variant="primary" leftIcon={<Plus />} onClick={onCreateEvent}>Create Event</Button>
      </div>
    </div>
  );
}
