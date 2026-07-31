import { useEffect, useRef } from 'react';
import { X, Heart, ExternalLink, Copy, Trash2, Clock, Building2, Users, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { activityTypeConfig, type HistoryItem } from './HistoryTypes';

interface HistoryDetailDrawerProps {
  item: HistoryItem;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onReopen: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function HistoryDetailDrawer({ item, isFavorite, onClose, onToggleFavorite, onReopen, onCopy, onDelete }: HistoryDetailDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const config = activityTypeConfig[item.type];
  const Icon = config.icon;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-text-primary/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} details`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] bg-elevated dark:bg-surface border-l border-border-subtle shadow-cx-xl animate-slide-right overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-elevated dark:bg-surface">
          <div className="flex items-center gap-2">
            <Badge variant="soft" tone="accent" className="text-2xs">{config.label}</Badge>
            <Badge variant="soft" tone="neutral" className="text-2xs">{item.status === 'completed' ? 'Completed' : 'Draft'}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-danger-500 text-danger-500')} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-page font-semibold text-text-primary">{item.title}</h2>
              <p className="mt-1 text-body text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-caption text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {item.date} at {item.time}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {item.workspace}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {item.department}
            </span>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-2 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <p className="text-caption font-semibold text-text-primary">Generated Content</p>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-border-subtle" />
              <div className="h-3 w-5/6 rounded bg-border-subtle" />
              <div className="h-3 w-4/6 rounded bg-border-subtle" />
              <div className="h-3 w-full rounded bg-border-subtle" />
              <div className="h-3 w-3/4 rounded bg-border-subtle" />
            </div>
            <p className="mt-3 text-2xs text-text-tertiary">Full generated content preview will appear here.</p>
          </div>

          <div className="border border-border-subtle rounded-xl divide-y divide-border-subtle">
            <RelatedRow icon={<Icon className="h-4 w-4" />} label="Related Conversation" value={item.title} />
            <RelatedRow icon={<Icon className="h-4 w-4" />} label="Related Report" value={item.title} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReopen}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-caption text-text-secondary hover:bg-surface-2 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Reopen Conversation
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-caption text-text-secondary hover:bg-surface-2 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Content
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-caption text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-elevated dark:bg-surface px-6 py-4">
          <Button fullWidth size="lg" leftIcon={<ExternalLink />} onClick={onReopen}>
            Reopen in Collabix AI
          </Button>
        </div>
      </div>
    </>
  );
}

function RelatedRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors">
      <span className="text-text-tertiary">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-2xs text-text-tertiary">{label}</p>
        <p className="text-caption font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
