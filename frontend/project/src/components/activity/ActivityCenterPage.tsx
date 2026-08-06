import { useMemo, useState, useCallback } from 'react';
import { AlarmClock, SearchX, Bot, FolderKanban } from 'lucide-react';
import { ActivityHeader } from './ActivityHeader';
import { ActivityFilters } from './ActivityFilters';
import { ActivityTimeline, ActivityTimelineGroup } from './ActivityTimeline';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { activityFilters, groupLabels, activityTypeConfig, type ActivityItem, type ActivityFilter, type ActivityType } from './ActivityTypes';
import { AIEmptyState } from '../ai/AIEmptyState';
import { AILoadingTimeline } from '../ai/AILoadingCard';
import { useWorkspaceDashboard, usePersonalDashboard, useWorkspacesList } from '../../services/workspace-hooks';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import { useAuth } from '../../lib/auth-context';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

type PageState = 'loading' | 'error' | 'ready';

const typeKeywords: [ActivityType, RegExp][] = [
  ['ai-report-generated', /ai.*report|report.*ai/i],
  ['ai-summary-generated', /ai.*summar|summar.*ai/i],
  ['ai-conversation-created', /ai.*conversation|conversation.*ai/i],
  ['report-generated', /\breport/i],
  ['handover-submitted', /handover/i],
  ['knowledge-published', /knowledge|article/i],
  ['document-uploaded', /document|file|upload/i],
  ['document-updated', /document.*update|update.*document/i],
  ['task-assigned', /assign.*task|task.*assign/i],
  ['task-completed', /task.*complet|complet.*task/i],
  ['project-created', /project.*creat|creat.*project/i],
  ['user-joined', /user.*join|join.*user|new.*member|member.*added/i],
  ['department-updated', /department/i],
  ['role-changed', /\brole\b/i],
  ['permission-updated', /permission/i],
  ['workspace-created', /workspace.*creat|creat.*workspace/i],
  ['profile-updated', /profile/i],
];

function inferType(description: string, rawType?: string): ActivityType {
  const text = `${rawType ?? ''} ${description}`;
  for (const [type, re] of typeKeywords) {
    if (re.test(text)) return type;
  }
  return 'profile-updated';
}

function computeGroup(timestamp: string): ActivityItem['group'] {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return 'last-month';
  const now = Date.now();
  const dayMs = 86400000;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  if (time >= startOfToday) return 'today';
  if (time >= startOfToday - dayMs) return 'yesterday';
  if (time >= now - 7 * dayMs) return 'last-7-days';
  return 'last-month';
}

function filterMatches(filter: ActivityFilter, item: ActivityItem, currentUser: string): boolean {
  switch (filter) {
    case 'all':
    case 'workspace':
      return true;
    case 'my-activity':
      return item.actor.name === currentUser;
    case 'projects':
      return item.type === 'project-created';
    case 'tasks':
      return item.type === 'task-assigned' || item.type === 'task-completed';
    case 'documents':
      return item.type === 'document-uploaded' || item.type === 'document-updated';
    case 'knowledge':
      return item.type === 'knowledge-published';
    case 'reports':
      return item.type === 'report-generated' || item.type === 'ai-report-generated';
    case 'handover':
      return item.type === 'handover-submitted';
    case 'ai-activity':
      return item.type.startsWith('ai-');
    case 'administration':
      return (
        item.type === 'user-joined' ||
        item.type === 'department-updated' ||
        item.type === 'role-changed' ||
        item.type === 'permission-updated' ||
        item.type === 'workspace-created'
      );
    case 'today':
      return item.group === 'today';
    case 'this-week':
      return item.group === 'today' || item.group === 'yesterday' || item.group === 'last-7-days';
    case 'this-month':
      return item.group === 'today' || item.group === 'yesterday' || item.group === 'last-7-days' || item.group === 'last-month';
    case 'department':
    case 'team':
    case 'favorites':
    default:
      return false;
  }
}

export function ActivityCenterPage() {
  const [state, setState] = useState<PageState>('ready');
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wsFromUrl = useWorkspaceId();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspacesList();
  const workspaceId = wsFromUrl || (workspaces && workspaces.length > 0 ? workspaces[0].id : '');

  const { data: dash, isLoading: dashLoading, isError: dashError, refetch } = useWorkspaceDashboard(workspaceId || undefined);
  const { data: personal } = usePersonalDashboard(workspaceId || undefined);
  const { user } = useAuth();

  const isLoading = workspacesLoading || dashLoading;
  const isError = dashError;

  const currentUser = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  const activityItems = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const a of dash?.recentActivities ?? []) {
      const type = inferType(a.description);
      const config = activityTypeConfig[type] ?? activityTypeConfig['profile-updated'];
      items.push({
        id: a.id,
        type,
        icon: config.icon,
        title: config.label,
        description: a.description,
        actor: { name: a.actorName || 'System', avatar: '' },
        project: a.projectName,
        timestamp: a.createdAt,
        group: computeGroup(a.createdAt),
      });
    }

    for (let i = 0; i < (personal?.workspaceActivities?.length ?? 0); i += 1) {
      const a = personal!.workspaceActivities[i];
      const type = inferType(a.description, a.type);
      const config = activityTypeConfig[type] ?? activityTypeConfig['profile-updated'];
      items.push({
        id: `ws-activity-${i}`,
        type,
        icon: config.icon,
        title: config.label,
        description: a.description,
        actor: { name: a.actorName || 'System', avatar: '' },
        timestamp: a.timestamp,
        group: computeGroup(a.timestamp),
      });
    }

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [dash, personal]);

  const filtered = useMemo(() => {
    return activityItems.filter((item) => filterMatches(activeFilter, item, currentUser));
  }, [activityItems, activeFilter, currentUser]);

  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  const groupOrder = ['today', 'yesterday', 'last-7-days', 'last-month'];

  const handleSelect = useCallback((item: ActivityItem) => {
    setSelected(item);
    setDrawerOpen(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setState('loading');
    await refetch();
    setState('ready');
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (filtered.length === 0) return;
    const header = 'Type,Title,Description,Actor,Project,Timestamp';
    const rows = filtered.map((item) =>
      [item.type, item.title, item.description, item.actor.name, item.project ?? '', item.timestamp].map(csvEscape).join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-center-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  if (state === 'loading' || isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3"><div aria-hidden="true" className="h-10 w-10 rounded-xl bg-surface-2 animate-shimmer" /><div className="space-y-1.5"><div aria-hidden="true" className="h-5 w-48 bg-surface-2 animate-shimmer rounded" /><div aria-hidden="true" className="h-4 w-64 bg-surface-2 animate-shimmer rounded" /></div></div>
        <div className="flex gap-2"><div aria-hidden="true" className="h-8 w-24 rounded-full bg-surface-2 animate-shimmer" /><div aria-hidden="true" className="h-8 w-24 rounded-full bg-surface-2 animate-shimmer" /><div aria-hidden="true" className="h-8 w-28 rounded-full bg-surface-2 animate-shimmer" /></div>
        <AILoadingTimeline />
      </div>
    );
  }

  if (state === 'error' || isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10"><AlarmClock className="h-6 w-6" /></div>
        <h3 className="text-section font-semibold text-text-primary">Unable to load activity</h3>
        <p className="mt-1 max-w-sm text-body text-text-tertiary text-center">Something went wrong. Please try again.</p>
        <button type="button" onClick={handleRefresh} className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-body font-medium text-white hover:bg-accent-700 transition-colors">Retry</button>
      </div>
    );
  }

  const hasActivity = Object.values(grouped).some((g) => g.length > 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1440px] mx-auto">
      <ActivityHeader onRefresh={handleRefresh} onExport={handleExport} onFilter={() => {}} />

      <ActivityFilters filters={activityFilters} active={activeFilter} onSelect={setActiveFilter} />

      {!hasActivity ? (
        <div className="py-12">
          {activeFilter === 'ai-activity' ? (
            <AIEmptyState icon={<Bot className="h-6 w-6" />} title="No AI Activity" description="AI activity from Collabix AI will appear here." />
          ) : activeFilter === 'projects' ? (
            <AIEmptyState icon={<FolderKanban className="h-6 w-6" />} title="No Project Activity" description="Project activity will appear here as your team works." />
          ) : activeFilter === 'department' || activeFilter === 'team' || activeFilter === 'favorites' ? (
            <AIEmptyState icon={<SearchX className="h-6 w-6" />} title="No Activity Found" description="No activity has been recorded for this scope yet." />
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
