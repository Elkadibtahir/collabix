import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Calendar, Clock, MapPin, Users, Briefcase, Building2, FolderKanban, Paperclip, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { eventCategoryConfig, type CalendarEvent } from './CalendarTypes';

interface CalendarEventDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

export function CalendarEventDrawer({ event, open, onClose }: CalendarEventDrawerProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  if (!event) return null;

  const cfg = eventCategoryConfig[event.category];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-text-primary/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      )}
      <div
        ref={ref} role="dialog" aria-modal="true" aria-label={`Event: ${event.title}`} tabIndex={-1}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-border-subtle bg-elevated shadow-cx-xl transition-transform duration-300 flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <p className="text-section font-semibold text-text-primary">Event Details</p>
          <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="space-y-2">
            <Badge variant="soft" tone={cfg.color.includes('danger') ? 'danger' : cfg.color.includes('success') ? 'success' : cfg.color.includes('warning') ? 'warning' : 'accent'}>{cfg.label}</Badge>
            <p className="text-body-lg font-semibold text-text-primary">{event.title}</p>
            {event.description && <p className="text-body text-text-secondary leading-relaxed">{event.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface p-3">
              <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><Calendar className="h-3.5 w-3.5" /><span>Date</span></div>
              <p className="text-caption font-medium text-text-primary">{event.date}</p>
            </div>
            {event.startTime && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><Clock className="h-3.5 w-3.5" /><span>Time</span></div>
                <p className="text-caption font-medium text-text-primary">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
              </div>
            )}
            {event.location && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><MapPin className="h-3.5 w-3.5" /><span>Location</span></div>
                <p className="text-caption font-medium text-text-primary">{event.location}</p>
              </div>
            )}
            {event.workspace && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><Briefcase className="h-3.5 w-3.5" /><span>Workspace</span></div>
                <p className="text-caption font-medium text-text-primary">{event.workspace}</p>
              </div>
            )}
            {event.department && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><Building2 className="h-3.5 w-3.5" /><span>Department</span></div>
                <p className="text-caption font-medium text-text-primary">{event.department}</p>
              </div>
            )}
            {event.project && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1"><FolderKanban className="h-3.5 w-3.5" /><span>Project</span></div>
                <p className="text-caption font-medium text-text-primary">{event.project}</p>
              </div>
            )}
          </div>

          {event.participants && event.participants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption text-text-tertiary"><Users className="h-3.5 w-3.5" /><span className="font-semibold text-text-primary">Participants</span></div>
              <div className="flex flex-wrap gap-2">{event.participants.map((p) => (<Badge key={p} variant="soft" tone="neutral">{p}</Badge>))}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
