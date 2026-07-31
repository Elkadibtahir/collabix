import { Heart, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { activityTypeConfig, type HistoryItem } from './HistoryTypes';

interface HistoryActivityCardProps {
  item: HistoryItem;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}

const categoryTone: Record<string, 'accent' | 'info' | 'success' | 'warning' | 'neutral'> = {
  conversations: 'accent',
  reports: 'success',
  summaries: 'info',
  knowledge: 'neutral',
  analytics: 'warning',
  handover: 'accent',
};

export function HistoryActivityCard({ item, isFavorite, onClick, onToggleFavorite }: HistoryActivityCardProps) {
  const config = activityTypeConfig[item.type];
  const Icon = config.icon;
  const tone = categoryTone[item.category] || 'neutral';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-start gap-4 rounded-2xl border border-border-subtle bg-elevated dark:bg-surface p-5 text-left hover:shadow-cx-sm hover:-translate-y-0.5 transition-all duration-150"
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          tone === 'accent' && 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
          tone === 'info' && 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
          tone === 'success' && 'bg-success-50 text-success-600 dark:bg-success-100/10 dark:text-success-600',
          tone === 'warning' && 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-600',
          tone === 'neutral' && 'bg-surface-2 text-text-tertiary',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-body font-semibold text-text-primary truncate">{item.title}</p>
              <Badge variant="soft" tone="neutral" className="text-2xs shrink-0">{config.label}</Badge>
            </div>
            <p className="mt-1 text-caption text-text-tertiary leading-relaxed line-clamp-2">{item.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
            >
              <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-danger-500 text-danger-500')} />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Delete"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-2xs text-text-tertiary">
          <span>{item.workspace}</span>
          <span>·</span>
          <span>{item.department}</span>
          <span>·</span>
          <span>{item.time}</span>
          <span>·</span>
          <Badge variant="soft" tone={item.status === 'completed' ? 'success' : 'neutral'} className="text-2xs">
            {item.status === 'completed' ? 'Completed' : 'Draft'}
          </Badge>
        </div>
      </div>
    </button>
  );
}
