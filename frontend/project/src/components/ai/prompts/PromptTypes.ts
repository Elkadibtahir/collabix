import type { LucideIcon } from 'lucide-react';
import {
  Star,
  BarChart3,
  FileText,
  BookOpen,
  ScrollText,
  Users,
  Building2,
  Shield,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';

export type PromptCategoryId =
  | 'favorites'
  | 'analytics'
  | 'reports'
  | 'knowledge'
  | 'handover'
  | 'team-productivity'
  | 'workspace'
  | 'administration'
  | 'projects'
  | 'tasks';

export interface PromptCategory {
  id: PromptCategoryId;
  label: string;
  icon: LucideIcon;
}

export const promptCategories: PromptCategory[] = [
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'handover', label: 'Handover', icon: ScrollText },
  { id: 'team-productivity', label: 'Team Productivity', icon: Users },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'administration', label: 'Administration', icon: Shield },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: PromptCategoryId;
  tags: string[];
  businessObjective: string;
  useCases: string[];
  requiredContext: string[];
  expectedOutput: string;
  executionTime: string;
  lastUsed?: string;
  favorite: boolean;
  featured?: boolean;
}
