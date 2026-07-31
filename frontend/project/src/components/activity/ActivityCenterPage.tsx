import { useState, useCallback } from 'react';
import { AlarmClock, SearchX, Bot, FolderKanban } from 'lucide-react';
import { ActivityHeader } from './ActivityHeader';
import { ActivityFilters } from './ActivityFilters';
import { ActivityTimeline, ActivityTimelineGroup } from './ActivityTimeline';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { activityFilters, groupLabels, type ActivityItem, type ActivityFilter } from './ActivityTypes';
import { AIEmptyState } from '../ai/AIEmptyState';
import { AILoadingTimeline } from '../ai/AILoadingCard';

type PageState = 'loading' | 'error' | 'ready';

export function ActivityCenterPage() {
  const [state, setState] = useState<PageState>('ready');
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = activeFilter === 'all' ? [] : [];

  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const groupOrder = ['today', 'yesterday', 'last-7-days', 'last-month'];

  const handleSelect = useCallback((item: ActivityItem) => {
    setSelected(item);
    setDrawerOpen(true);
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3"><div aria-hidden="true" className="h-10 w-10 rounded-xl bg-surface-2 animate-shimmer" /><div className="space-y-1.5"><div aria-hidden="true" className="h-5 w-48 bg-surface-2 animate-shimmer rounded" /><div aria-hidden="true" className="h-4 w-64 bg-surface-2 animate-shimmer rounded" /></div></div>
        <div className="flex gap-2"><div aria-hidden="true" className="h-8 w-24 rounded-full bg-surface-2 animate-shimmer" /><div aria-hidden="true" className="h-8 w-24 rounded-full bg-surface-2 animate-shimmer" /><div aria-hidden="true" className="h-8 w-28 rounded-full bg-surface-2 animate-shimmer" /></div>
        <AILoadingTimeline />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10"><AlarmClock className="h-6 w-6" /></div>
        <h3 className="text-section font-semibold text-text-primary">Unable to load activity</h3>
        <p className="mt-1 max-w-sm text-body text-text-tertiary text-center">Something went wrong. Please try again.</p>
        <button type="button" onClick={() => setState('loading')} className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-body font-medium text-white hover:bg-accent-700 transition-colors">Retry</button>
      </div>
    );
  }

  const hasActivity = Object.values(grouped).some((g) => g.length > 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1440px] mx-auto">
      <ActivityHeader onRefresh={() => {}} onExport={() => {}} onFilter={() => {}} />

      <ActivityFilters filters={activityFilters} active={activeFilter} onSelect={setActiveFilter} />

      {!hasActivity ? (
        <div className="py-12">
          {activeFilter === 'ai-activity' ? (
            <AIEmptyState icon={<Bot className="h-6 w-6" />} title="No AI Activity" description="AI activity from Collabix AI will appear here." />
          ) : activeFilter === 'projects' ? (
            <AIEmptyState icon={<FolderKanban className="h-6 w-6" />} title="No Project Activity" description="Project activity will appear here as your team works." />
          ) : (
            <AIEmptyState icon={<SearchX className="h-6 w-6" />} title="No Activity Found" description={activeFilter === 'all' ? 'No activity has been recorded yet.' : 'No results match the selected filter.'} />
          )}
        </div>
      ) : (
        <ActivityTimeline>
          {groupOrder.map((g) => {
            const items = grouped[g];
            if (!items || items.length === 0) return null;
            return (
              <ActivityTimelineGroup key={g} label={groupLabels[g]}>
                {items.map((item) => (
                  <ActivityCard key={item.id} item={item} onSelect={handleSelect} />
                ))}
              </ActivityTimelineGroup>
            );
          })}
        </ActivityTimeline>
      )}

      <ActivityDetailDrawer item={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
