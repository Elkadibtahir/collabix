import type { LucideIcon } from 'lucide-react';

export type TeamStatus = 'active' | 'forming' | 'restructuring' | 'archived';

export type Availability = 'available' | 'busy' | 'away' | 'offline';

export type ProjectStatus = 'on-track' | 'at-risk' | 'delayed' | 'completed';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string;
  workload: number;
  availability: Availability;
  online: boolean;
  tone: number;
}

export interface TeamProject {
  id: string;
  name: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
}

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  tone: 'accent' | 'info' | 'success' | 'warning' | 'neutral';
  title: string;
  actor: string;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  manager: string;
  managerTone: number;
  members: TeamMember[];
  memberCount: number;
  activeProjects: number;
  openTasks: number;
  completedTasks: number;
  completionRate: number;
  workload: number;
  status: TeamStatus;
  createdAt: string;
  projects: TeamProject[];
  activity: ActivityItem[];
  upcomingDeadlines: number;
}

export type ModalState =
  | { kind: 'create' }
  | { kind: 'edit'; team: Team }
  | { kind: 'archive'; team: Team }
  | { kind: 'assign'; team: Team }
  | { kind: 'change-manager'; team: Team }
  | { kind: 'move'; team: Team }
  | null;

export const statusBadge: Record<TeamStatus, { tone: 'success' | 'info' | 'warning' | 'neutral'; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  forming: { tone: 'info', label: 'Forming' },
  restructuring: { tone: 'warning', label: 'Restructuring' },
  archived: { tone: 'neutral', label: 'Archived' },
};

export const availabilityMeta: Record<Availability, { label: string; dot: string }> = {
  available: { label: 'Available', dot: 'bg-success-500' },
  busy: { label: 'Busy', dot: 'bg-danger-500' },
  away: { label: 'Away', dot: 'bg-warning-500' },
  offline: { label: 'Offline', dot: 'bg-text-tertiary' },
};

export const projectStatusMeta: Record<ProjectStatus, { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  'on-track': { tone: 'success', label: 'On Track' },
  'at-risk': { tone: 'warning', label: 'At Risk' },
  delayed: { tone: 'danger', label: 'Delayed' },
  completed: { tone: 'neutral', label: 'Completed' },
};
