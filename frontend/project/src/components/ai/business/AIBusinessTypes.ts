import {
  BarChart3,
  ScrollText,
  BookOpen,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export type AIModule = 'analytics' | 'handover' | 'knowledge' | 'reports';

export const moduleConfig: Record<AIModule, { icon: LucideIcon; label: string; description: string; color: string }> = {
  analytics: {
    icon: BarChart3,
    label: 'Analytics AI',
    description: 'Analyze business metrics, detect trends and generate performance insights.',
    color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
  },
  handover: {
    icon: ScrollText,
    label: 'Handover AI',
    description: 'Review handover journals, detect risks and ensure work continuity.',
    color: 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
  },
  knowledge: {
    icon: BookOpen,
    label: 'Knowledge AI',
    description: 'Search, explain and explore your company knowledge base.',
    color: 'bg-success-50 text-success-600 dark:bg-success-100/10 dark:text-success-300',
  },
  reports: {
    icon: FileText,
    label: 'Report AI',
    description: 'Generate professional executive reports and management summaries.',
    color: 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-300',
  },
};

export interface ContextOption {
  id: string;
  label: string;
  placeholder: string;
}

export const analyticsContext: ContextOption[] = [
  { id: 'workspace', label: 'Workspace', placeholder: 'Select workspace...' },
  { id: 'department', label: 'Department', placeholder: 'Select department...' },
  { id: 'team', label: 'Team', placeholder: 'Select team...' },
  { id: 'project', label: 'Project', placeholder: 'Select project...' },
  { id: 'period', label: 'Reporting Period', placeholder: 'Select period...' },
  { id: 'type', label: 'Analysis Type', placeholder: 'Select analysis type...' },
];

export const handoverContext: ContextOption[] = [
  { id: 'workspace', label: 'Workspace', placeholder: 'Select workspace...' },
  { id: 'department', label: 'Department', placeholder: 'Select department...' },
  { id: 'team', label: 'Team', placeholder: 'Select team...' },
  { id: 'shift', label: 'Shift', placeholder: 'Select shift...' },
  { id: 'date', label: 'Date', placeholder: 'Select date...' },
  { id: 'journal', label: 'Journal Entry', placeholder: 'Select journal entry...' },
];

export const knowledgeContext: ContextOption[] = [
  { id: 'workspace', label: 'Workspace', placeholder: 'Select workspace...' },
  { id: 'department', label: 'Department', placeholder: 'Select department...' },
  { id: 'category', label: 'Knowledge Category', placeholder: 'Select category...' },
];

export const reportContext: ContextOption[] = [
  { id: 'workspace', label: 'Workspace', placeholder: 'Select workspace...' },
  { id: 'department', label: 'Department', placeholder: 'Select department...' },
  { id: 'project', label: 'Project', placeholder: 'Select project...' },
  { id: 'type', label: 'Report Type', placeholder: 'Select report type...' },
  { id: 'period', label: 'Date Range', placeholder: 'Select date range...' },
];

export interface FollowUpAction {
  id: string;
  label: string;
}

export const analyticsFollowUps: FollowUpAction[] = [
  { id: 'f1', label: 'Generate Executive Report' },
  { id: 'f2', label: 'Explain Further' },
  { id: 'f3', label: 'Compare Previous Period' },
  { id: 'f4', label: 'Find Related Knowledge' },
  { id: 'f5', label: 'Continue Analysis' },
];

export const handoverFollowUps: FollowUpAction[] = [
  { id: 'f1', label: 'Generate PDF' },
  { id: 'f2', label: 'Open Complete Journal' },
  { id: 'f3', label: 'Continue Review' },
  { id: 'f4', label: 'Compare Previous Shift' },
  { id: 'f5', label: 'Identify Training Needs' },
];

export const knowledgeFollowUps: FollowUpAction[] = [
  { id: 'f1', label: 'Open Source Document' },
  { id: 'f2', label: 'Find Related Documents' },
  { id: 'f3', label: 'Explain Further' },
  { id: 'f4', label: 'Summarize Key Policies' },
  { id: 'f5', label: 'Continue Exploration' },
];

export const reportFollowUps: FollowUpAction[] = [
  { id: 'f1', label: 'Export PDF' },
  { id: 'f2', label: 'Copy Report' },
  { id: 'f3', label: 'Regenerate' },
  { id: 'f4', label: 'Continue in Conversation' },
  { id: 'f5', label: 'Add to Favorites' },
];

export interface ResourceLink {
  id: string;
  title: string;
  type: string;
}

export const analyticsResources: ResourceLink[] = [];

export const handoverResources: ResourceLink[] = [];

export const knowledgeResources: ResourceLink[] = [];

export const reportResources: ResourceLink[] = [];


