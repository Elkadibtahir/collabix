export type ActivityType =
  | 'workspace-created' | 'project-created'
  | 'task-assigned' | 'task-completed'
  | 'document-uploaded' | 'document-updated'
  | 'knowledge-published'
  | 'report-generated'
  | 'handover-submitted'
  | 'user-joined'
  | 'department-updated'
  | 'role-changed'
  | 'permission-updated'
  | 'ai-report-generated' | 'ai-conversation-created' | 'ai-summary-generated'
  | 'profile-updated';

export interface ActivityActor {
  name: string;
  avatar: string;
}

export interface ActivityResource {
  type: string;
  title: string;
  path: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  icon: string;
  title: string;
  description: string;
  actor: ActivityActor;
  workspace?: string;
  department?: string;
  project?: string;
  timestamp: string;
  group: 'today' | 'yesterday' | 'last-7-days' | 'last-month';
  status?: 'completed' | 'pending' | 'in-progress';
  resources?: ActivityResource[];
  metadata?: Record<string, string>;
}

export type ActivityFilter =
  | 'all' | 'my-activity'
  | 'workspace' | 'department' | 'team'
  | 'projects' | 'tasks'
  | 'documents' | 'knowledge'
  | 'reports' | 'handover'
  | 'ai-activity' | 'administration'
  | 'today' | 'this-week' | 'this-month'
  | 'favorites';

export const activityTypeConfig: Record<ActivityType, { label: string; icon: string }> = {
  'workspace-created': { label: 'Workspace Created', icon: 'briefcase' },
  'project-created': { label: 'Project Created', icon: 'folder-kanban' },
  'task-assigned': { label: 'Task Assigned', icon: 'check-square' },
  'task-completed': { label: 'Task Completed', icon: 'check-circle' },
  'document-uploaded': { label: 'Document Uploaded', icon: 'file-text' },
  'document-updated': { label: 'Document Updated', icon: 'file-edit' },
  'knowledge-published': { label: 'Knowledge Article Published', icon: 'book-open' },
  'report-generated': { label: 'Report Generated', icon: 'bar-chart-3' },
  'handover-submitted': { label: 'Handover Submitted', icon: 'scroll-text' },
  'user-joined': { label: 'User Joined', icon: 'user-plus' },
  'department-updated': { label: 'Department Updated', icon: 'building-2' },
  'role-changed': { label: 'Role Changed', icon: 'shield' },
  'permission-updated': { label: 'Permission Updated', icon: 'lock' },
  'ai-report-generated': { label: 'AI Report Generated', icon: 'sparkles' },
  'ai-conversation-created': { label: 'AI Conversation Created', icon: 'message-square' },
  'ai-summary-generated': { label: 'AI Summary Generated', icon: 'zap' },
  'profile-updated': { label: 'Profile Updated', icon: 'user' },
};

// No mock data - activity items come from backend API

export const activityFilters: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All Activity' },
  { id: 'my-activity', label: 'My Activity' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'department', label: 'Department' },
  { id: 'team', label: 'Team' },
  { id: 'projects', label: 'Projects' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'documents', label: 'Documents' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'reports', label: 'Reports' },
  { id: 'handover', label: 'Handover' },
  { id: 'ai-activity', label: 'AI Activity' },
  { id: 'administration', label: 'Administration' },
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'favorites', label: 'Favorites' },
];

export const groupLabels: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  'last-7-days': 'Last 7 Days',
  'last-month': 'Last Month',
};
