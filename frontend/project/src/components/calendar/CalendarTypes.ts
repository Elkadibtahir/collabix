export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type EventCategory =
  | 'task-deadline' | 'project-milestone'
  | 'workspace-event' | 'department-event' | 'team-meeting'
  | 'handover-shift' | 'report'
  | 'personal-reminder' | 'ai-recommendation';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category: EventCategory;
  priority: 'high' | 'medium' | 'low';
  participants?: string[];
  workspace?: string;
  department?: string;
  project?: string;
  completed?: boolean;
}

export const eventCategoryConfig: Record<EventCategory, { label: string; color: string }> = {
  'task-deadline': { label: 'Deadline', color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-300 border-l-danger-500' },
  'project-milestone': { label: 'Milestone', color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300 border-l-accent-500' },
  'workspace-event': { label: 'Workspace', color: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-300 border-l-info-500' },
  'department-event': { label: 'Department', color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-300 border-l-warning-500' },
  'team-meeting': { label: 'Meeting', color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-300 border-l-success-500' },
  'handover-shift': { label: 'Handover', color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300 border-l-accent-500' },
  report: { label: 'Report', color: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-300 border-l-info-500' },
  'personal-reminder': { label: 'Reminder', color: 'bg-surface-2 text-text-secondary border-l-text-tertiary' },
  'ai-recommendation': { label: 'AI Suggestion', color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300 border-l-accent-500' },
};

export type CalendarFilter = 'all' | 'workspace' | 'department' | 'team' | 'project' | 'assigned-to-me'
  | 'ai-events' | 'reports' | 'meetings' | 'handover' | 'deadlines';

export const calendarFilters: { id: CalendarFilter; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'department', label: 'Department' },
  { id: 'team', label: 'Team' },
  { id: 'project', label: 'Project' },
  { id: 'assigned-to-me', label: 'Assigned to Me' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'handover', label: 'Handover' },
  { id: 'reports', label: 'Reports' },
  { id: 'ai-events', label: 'AI Events' },
];

export const today = new Date().toISOString().split('T')[0];

// Calendar events come from backend API

export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
