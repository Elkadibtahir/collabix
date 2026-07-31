export interface NotificationResponse {
  id: string;
  workspaceId: string;
  recipientId: string;
  notificationType: string;
  title: string;
  body?: string;
  linkUrl?: string;
  projectId?: string;
  taskId?: string;
  commentId?: string;
  documentId?: string;
  knowledgeBaseId?: string;
  handoverEntryId?: string;
  resourceType?: string;
  resourceId?: string;
  readAt?: string;
  status: 'UNREAD' | 'READ' | 'DISMISSED' | 'ARCHIVED';
  priority: string;
  category: string;
  groupKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilter {
  search?: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
  type?: string;
  source?: string;
}

export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function getNotifIcon(type: string): string {
  const icons: Record<string, string> = {
    MENTION: '💬',
    DOCUMENT_UPLOADED: '📄',
    TASK_ASSIGNED: '📋',
    NEW_COMMENT: '💬',
    KNOWLEDGE_PUBLISHED: '📚',
    HANDOVER_GENERATED: '📝',
    HANDOVER_REMINDER: '⏰',
    CANDIDATE_UPDATED: '👤',
    ATS_STATUS_CHANGED: '📋',
    AI_JOB_COMPLETED: '🤖',
    ATTENDANCE_CHECK_IN: '✅',
    ATTENDANCE_CHECK_OUT: '❌',
    ATTENDANCE_CORRECTED: '🔄',
    ATTENDANCE_MISSING_CHECKOUT: '⚠️',
    ATTENDANCE_LATE_ARRIVAL: '⏰',
    ATTENDANCE_EXCESSIVE_OVERTIME: '🕐',
    REVIEW_ASSIGNED: '📝',
    REVIEW_SUBMITTED: '📤',
    REVIEW_APPROVED: '✅',
    REVIEW_REJECTED: '❌',
    CANDIDATE_CREATED: '👤',
    INTERVIEW_SCHEDULED: '📅',
    INTERVIEW_CANCELLED: '🚫',
    INTERVIEW_COMPLETED: '✅',
    RECRUITER_NOTE_ADDED: '📝',
    ATTACHMENT_UPLOADED: '📎',
    EMPLOYEE_CREATED: '👤',
    EMPLOYEE_TRANSFERRED: '🔄',
    ONBOARDING_STARTED: '🚀',
    ONBOARDING_COMPLETED: '🎉',
    ONBOARDING_OVERDUE: '⚠️',
    SPRINT_CREATED: '📋',
    SPRINT_STARTED: '▶️',
    SPRINT_COMPLETED: '✅',
    AUDIT_CREATED: '🔍',
    CAMPAIGN_CREATED: '📢',
  };
  return icons[type] ?? '🔔';
}
