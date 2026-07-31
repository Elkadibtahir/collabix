import {
  MessageSquare,
  FileText,
  ScrollText,
  BookOpen,
  BarChart3,
  Lightbulb,
  FileSearch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type ActivityType =
  | 'conversation'
  | 'executive-summary'
  | 'weekly-report'
  | 'knowledge-search'
  | 'handover-summary'
  | 'risk-analysis'
  | 'recommendations'
  | 'document-explanation';

export type ActivityCategory = 'conversations' | 'reports' | 'summaries' | 'knowledge' | 'analytics' | 'handover' | 'favorites';

export interface HistoryItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  category: ActivityCategory;
  workspace: string;
  department: string;
  date: string;
  time: string;
  favorite: boolean;
  status: 'completed' | 'draft';
}

export const activityTypeConfig: Record<ActivityType, { icon: LucideIcon; label: string }> = {
  conversation: { icon: MessageSquare, label: 'Conversation' },
  'executive-summary': { icon: FileText, label: 'Executive Summary' },
  'weekly-report': { icon: BarChart3, label: 'Weekly Report' },
  'knowledge-search': { icon: BookOpen, label: 'Knowledge Search' },
  'handover-summary': { icon: ScrollText, label: 'Handover Summary' },
  'risk-analysis': { icon: FileSearch, label: 'Risk Analysis' },
  recommendations: { icon: Lightbulb, label: 'Recommendations' },
  'document-explanation': { icon: Sparkles, label: 'Document Explanation' },
};

export const filterOptions = [
  { id: 'all' as const, label: 'All Activity' },
  { id: 'conversations' as const, label: 'Conversations' },
  { id: 'reports' as const, label: 'Reports' },
  { id: 'summaries' as const, label: 'Summaries' },
  { id: 'knowledge' as const, label: 'Knowledge' },
  { id: 'analytics' as const, label: 'Analytics' },
  { id: 'handover' as const, label: 'Handover' },
  { id: 'favorites' as const, label: 'Favorites' },
];

export const timeFilterOptions = [
  { id: 'all-time' as const, label: 'All Time' },
  { id: 'today' as const, label: 'Today' },
  { id: 'this-week' as const, label: 'This Week' },
  { id: 'this-month' as const, label: 'This Month' },
];


