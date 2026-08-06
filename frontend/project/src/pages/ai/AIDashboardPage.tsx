import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, ScrollText, BookOpen, FileText, MessageSquare, Sparkles, Zap, Target, ListChecks, TrendingUp, Bot } from 'lucide-react';
import { AIHeader } from '../../components/ai/AIHeader';
import { AISection } from '../../components/ai/AISection';
import { AIHero } from '../../components/ai/AIHero';
import { AIStatCard } from '../../components/ai/AIStatCard';
import { AIActionCard } from '../../components/ai/AIActionCard';
import { AIActivityCard, type AIActivityItem } from '../../components/ai/AIActivityCard';
import { AIConversationPreview } from '../../components/ai/AIConversationPreview';
import { AIReportPreview, type AIReportItem } from '../../components/ai/AIReportPreview';
import { AIPromptPreview } from '../../components/ai/AIPromptPreview';
import { AISuggestionCard } from '../../components/ai/AISuggestionCard';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../lib/auth-context';
import { useDepartmentDashboard } from '../../services/department-hooks';
import { useAIReportHistory } from '../../services/reporting-ai-hooks';

const DEPT_ID = 'd1';

const quickActions = [
  { id: 'analytics', icon: <BarChart3 />, title: 'Analytics AI', description: 'Analyze dashboards and business metrics.', path: '/app/ai/analytics' },
  { id: 'reports', icon: <FileText />, title: 'Report AI', description: 'Generate professional executive reports.', path: '/app/ai/reports' },
  { id: 'knowledge', icon: <BookOpen />, title: 'Knowledge AI', description: 'Search and explain company knowledge.', path: '/app/knowledge' },
  { id: 'handover', icon: <ScrollText />, title: 'Handover AI', description: 'Generate executive handover summaries.', path: '/app/ai/handover' },
];

const suggestedActions = [
  { id: 's1', icon: <Zap />, title: "Summarize today's activity" },
  { id: 's2', icon: <FileText />, title: 'Generate a weekly report' },
  { id: 's3', icon: <BarChart3 />, title: 'Analyze workspace performance' },
  { id: 's4', icon: <Target />, title: 'Review project risks' },
  { id: 's5', icon: <BookOpen />, title: 'Explain company documentation' },
  { id: 's6', icon: <ListChecks />, title: 'Create executive summary' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function AIDashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('ws') ?? '';
  const { data: dashboard, isLoading, isError } = useDepartmentDashboard(workspaceId, DEPT_ID);
  const { data: reportHistory } = useAIReportHistory(workspaceId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="rounded-2xl border border-border-subtle bg-elevated p-8 sm:p-10">
          <div aria-hidden="true" className="h-4 w-32 rounded-md bg-surface-2 animate-shimmer mb-4" />
          <div aria-hidden="true" className="h-8 w-96 max-w-full rounded-md bg-surface-2 animate-shimmer mb-3" />
          <div aria-hidden="true" className="h-5 w-[500px] max-w-full rounded-md bg-surface-2 animate-shimmer mb-6" />
          <div className="flex gap-3">
            <div aria-hidden="true" className="h-11 w-44 rounded-lg bg-surface-2 animate-shimmer" />
            <div aria-hidden="true" className="h-11 w-48 rounded-lg bg-surface-2 animate-shimmer" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} aria-hidden="true" className="rounded-xl border border-border-subtle bg-elevated p-4">
              <div className="h-9 w-9 rounded-lg bg-surface-2 animate-shimmer mb-4" />
              <div className="h-3 w-20 bg-surface-2 animate-shimmer rounded mb-3" />
              <div className="h-6 w-16 bg-surface-2 animate-shimmer rounded mb-2" />
              <div className="h-3 w-24 bg-surface-2 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-text-tertiary">
          <Bot className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">AI Dashboard not ready</h3>
        <p className="mt-1 max-w-sm text-body text-text-tertiary text-center">
          The AI dashboard will be available once your workspace is set up with departments and AI features enabled.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => navigate('/app')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const { overview, taskSummary, departmentActivities, departmentNotifications } = dashboard;

  const aiStats = [
    { id: 'projects', icon: <MessageSquare />, label: 'Active Projects', value: String(overview.activeProjects), description: `${overview.totalMembers} team members`, tone: 'accent' as const },
    { id: 'tasks', icon: <FileText />, label: 'Active Tasks', value: String(taskSummary.activeTasks), description: `${taskSummary.overdueTasks} overdue`, tone: 'success' as const },
    { id: 'members', icon: <Sparkles />, label: 'Team Size', value: String(overview.totalMembers), description: `${overview.activeMembers} active`, tone: 'info' as const },
    { id: 'notifications', icon: <BookOpen />, label: 'Notifications', value: String(departmentNotifications?.length ?? 0), description: 'Recent alerts', tone: 'warning' as const },
    { id: 'archived', icon: <Zap />, label: 'Archived Tasks', value: String(taskSummary.archivedTasks), description: 'Completed', tone: 'danger' as const },
    { id: 'teams', icon: <TrendingUp />, label: 'Teams', value: String(overview.totalTeams), description: 'Active teams', tone: 'neutral' as const },
  ];

  const recentActivities: AIActivityItem[] = (departmentActivities ?? []).slice(0, 5).map((a) => ({
    id: a.id,
    icon: <MessageSquare />,
    title: a.description,
    description: a.projectName || 'General',
    timestamp: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'recent',
  }));

  const reportItems: AIReportItem[] = (reportHistory?.content ?? []).slice(0, 3).map((r) => ({
    id: r.reportId,
    title: r.title,
    category: r.reportType,
    date: r.generationDate ? new Date(r.generationDate).toLocaleDateString() : '',
    description: r.executiveSummary?.slice(0, 100) ?? '',
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <AIHeader />

      <AIHero
        greeting={`${getGreeting()}, ${user?.firstName ?? 'there'}.`}
        title="What would you like to accomplish today?"
        description="Collabix AI helps you analyze, summarize and generate business insights across your workspace."
      />

      <AISection title="Quick Actions" description="AI-powered tools to accelerate your work">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <AIActionCard key={action.id} icon={action.icon} title={action.title} description={action.description} onClick={() => navigate(action.path)} />
          ))}
        </div>
      </AISection>

      <AISection title="AI Statistics" description="Your AI workspace at a glance">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {aiStats.map((stat) => (
            <AIStatCard key={stat.id} icon={stat.icon} label={stat.label} value={stat.value} description={stat.description} tone={stat.tone} />
          ))}
        </div>
      </AISection>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AISection title="Recent AI Activities" description="Latest actions performed by Collabix AI">
            <Card>
              <CardBody>
                {recentActivities.length === 0 ? (
                  <p className="text-caption text-text-tertiary py-4 text-center">No activities yet</p>
                ) : (
                  <AIActivityCard items={recentActivities} />
                )}
              </CardBody>
            </Card>
          </AISection>
        </div>
        <div>
          <AISection title="Suggested Actions">
            <div className="flex flex-col gap-2">
              {suggestedActions.map((action) => (
                <AISuggestionCard key={action.id} icon={action.icon} title={action.title} onClick={() => navigate('/app/ai/analytics')} />
              ))}
            </div>
          </AISection>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <AIConversationPreview items={[]} onViewAll={() => toast({ title: 'Coming soon', tone: 'info' })} />
        <AIReportPreview items={reportItems} onViewAll={() => toast({ title: 'Coming soon', tone: 'info' })} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <AIPromptPreview items={[]} />
      </div>
    </div>
  );
}
