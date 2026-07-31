import type { LucideIcon } from 'lucide-react';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';
export type MemberStatus = 'active' | 'away' | 'offline' | 'inactive';
export type Availability = 'available' | 'busy' | 'away' | 'offline';

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tone: number;
  jobTitle: string;
  department: string;
  team: string;
  role: string; // member, lead, manager, director
  employmentType: EmploymentType;
  status: MemberStatus;
  availability: Availability;
  workload: number;
  lastActive: string;
  joinedDate: string;
  reportsTo?: string;
  directReports: number;
  skills: string[];
  currentProjects: number;
  currentTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  averageWorkload: number;
  bio?: string;
  location?: string;
  timezone?: string;
}

export interface MemberFilters {
  department?: string;
  team?: string;
  role?: string;
  status?: MemberStatus;
  employmentType?: EmploymentType;
  availability?: Availability;
  search?: string;
}

export interface MemberSortOption {
  label: string;
  value: 'name' | 'joinedDate' | 'workload' | 'tasks' | 'lastActive';
  direction: 'asc' | 'desc';
}
