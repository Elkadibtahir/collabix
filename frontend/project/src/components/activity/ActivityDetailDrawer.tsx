import { useEffect, useRef } from 'react';
import { X, ExternalLink, Calendar, Clock, User, Briefcase, Building2, FolderKanban, FileText, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { type ActivityItem } from './ActivityTypes';

interface ActivityDetailDrawerProps {
  item: ActivityItem | null;
  open: boolean;
  onClose: () => void;
}

export function ActivityDetailDrawer({ item, open, onClose }: ActivityDetailDrawerProps) {
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

  if (!item) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-text-primary/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      )}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Activity details: ${item.title}`}
        tabIndex={-1}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-border-subtle bg-elevated shadow-cx-xl transition-transform duration-300 flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <p className="text-section font-semibold text-text-primary">Activity Details</p>
          <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="space-y-2">
            <p className="text-body-lg font-semibold text-text-primary">{item.title}</p>
            <p className="text-body text-text-secondary leading-relaxed">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {item.actor && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Actor</span>
                </div>
                <p className="text-caption font-medium text-text-primary">{item.actor.name}</p>
              </div>
            )}
            {item.workspace && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Workspace</span>
                </div>
                <p className="text-caption font-medium text-text-primary">{item.workspace}</p>
              </div>
            )}
            {item.department && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Department</span>
                </div>
                <p className="text-caption font-medium text-text-primary">{item.department}</p>
              </div>
            )}
            {item.project && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>Project</span>
                </div>
                <p className="text-caption font-medium text-text-primary">{item.project}</p>
              </div>
            )}
            <div className="rounded-lg bg-surface p-3">
              <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Timestamp</span>
              </div>
              <p className="text-caption font-medium text-text-primary">{item.timestamp}</p>
            </div>
            {item.status && (
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-2 text-caption text-text-tertiary mb-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Status</span>
                </div>
                <Badge variant="soft" tone={item.status === 'completed' ? 'success' : item.status === 'in-progress' ? 'warning' : 'info'}>
                  {item.status}
                </Badge>
              </div>
            )}
          </div>

          {item.resources && item.resources.length > 0 && (
            <div className="space-y-2">
              <p className="text-caption font-semibold text-text-primary">Related Resources</p>
              <div className="space-y-1.5">
                {item.resources.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { navigate(r.path); onClose(); }}
                    className="flex w-full items-center gap-2 rounded-lg border border-border-subtle bg-surface p-2.5 text-left hover:shadow-cx-sm transition-all duration-150"
                  >
                    <FileText className="h-4 w-4 text-accent-600 dark:text-accent-400 shrink-0" />
                    <span className="flex-1 text-caption font-medium text-text-primary truncate">{r.title}</span>
                    <Badge variant="soft" tone="neutral" className="text-2xs">{r.type}</Badge>
                    <ExternalLink className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
