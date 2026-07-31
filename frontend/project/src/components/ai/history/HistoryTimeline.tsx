import { HistoryActivityCard } from './HistoryActivityCard';
import { type HistoryItem } from './HistoryTypes';

interface HistoryTimelineProps {
  groups: { label: string; items: HistoryItem[] }[];
  onItemClick: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

export function HistoryTimeline({ groups, onItemClick, onToggleFavorite, favorites }: HistoryTimelineProps) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-100/10">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
            </div>
            <h3 className="text-caption font-semibold text-text-primary">{group.label}</h3>
            <span className="text-2xs text-text-tertiary">{group.items.length}</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <div className="space-y-3 ml-10">
            {group.items.map((item) => (
              <HistoryActivityCard
                key={item.id}
                item={item}
                isFavorite={favorites.has(item.id)}
                onClick={() => onItemClick(item)}
                onToggleFavorite={() => onToggleFavorite(item.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
