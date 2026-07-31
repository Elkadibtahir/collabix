import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';
import {
  Briefcase, FolderKanban, CheckSquare, CheckCircle, FileText, FileEdit,
  BookOpen, BarChart3, ScrollText, UserPlus, Building2, Shield, Lock,
  Sparkles, MessageSquare, Zap, User, ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { type ActivityItem } from './ActivityTypes';

interface ActivityCardProps {
  item: ActivityItem;
  onSelect: (item: ActivityItem) => void;
}

const iconMap: Record<string, typeof Briefcase> = {
  briefcase: Briefcase, 'folder-kanban': FolderKanban, 'check-square': CheckSquare,
  'check-circle': CheckCircle, 'file-text': FileText, 'file-edit': FileEdit,
  'book-open': BookOpen, 'bar-chart-3': BarChart3, 'scroll-text': ScrollText,
  'user-plus': UserPlus, 'building-2': Building2, shield: Shield, lock: Lock,
  sparkles: Sparkles, 'message-square': MessageSquare, zap: Zap, user: User,
};

const iconBg: Record<string, string> = {
  briefcase: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
  'folder-kanban': 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
  'check-square': 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-300',
  'check-circle': 'bg-success-50 text-success-600 dark:bg-success-100/10 dark:text-success-300',
  'file-text': 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
  'file-edit': 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-300',
  'book-open': 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
  'bar-chart-3': 'bg-success-50 text-success-600 dark:bg-success-100/10 dark:text-success-300',
  'scroll-text': 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
  'user-plus': 'bg-success-50 text-success-600 dark:bg-success-100/10 dark:text-success-300',
  'building-2': 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
  shield: 'bg-danger-50 text-danger-600 dark:bg-danger-100/10 dark:text-danger-300',
  lock: 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-300',
  sparkles: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300',
  'message-square': 'bg-info-50 text-info-600 dark:bg-info-100/10 dark:text-info-300',
  zap: 'bg-warning-50 text-warning-600 dark:bg-warning-100/10 dark:text-warning-300',
  user: 'bg-surface-2 text-text-secondary dark:bg-surface-2',
};

const statusBadge: Record<string, { label: string; tone: 'success' | 'warning' | 'info' } | null> = {
  completed: { label: 'Completed', tone: 'success' },
  'in-progress': { label: 'In Progress', tone: 'warning' },
  pending: { label: 'Pending', tone: 'info' },
};

export function ActivityCard({ item, onSelect }: ActivityCardProps) {
  const Icon = iconMap[item.icon] || FileText;
  const bg = iconBg[item.icon] || iconBg['file-text'];
  const status = item.status ? statusBadge[item.status] : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`View details: ${item.title}`}
      className="group relative flex items-start gap-4 rounded-xl border border-border-subtle bg-elevated p-4 sm:p-5 text-left w-full transition-all duration-150 hover:shadow-cx-sm hover:-translate-y-0.5"
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', bg)}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-body font-semibold text-text-primary truncate">{item.title}</p>
          {status && <Badge variant="soft" tone={status.tone} className="text-2xs">{status.label}</Badge>}
        </div>
        <p className="text-caption text-text-secondary mt-0.5 line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-2xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-2 text-2xs font-bold text-text-secondary">{item.actor.avatar}</span>
            {item.actor.name}
          </span>
          {item.workspace && <span>{item.workspace}</span>}
          {item.department && <span>{item.department}</span>}
          {item.project && <span>{item.project}</span>}
          <span className="ml-auto">{item.timestamp}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
    </button>
  );
}
