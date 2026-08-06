// User Management Types
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  department?: string;
  team?: string;
  workspace: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  avatarTone?: number;
  permissions: string[];
}

export interface UserProfile extends User {
  phone?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  assignedProjects: string[];
  assignedTasks: string[];
  teams: string[];
  departments: string[];
}

// Role Management Types
export type PermissionScope = 'workspace' | 'department' | 'team' | 'project' | 'personal';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  scope: PermissionScope;
  action: string;
  resource: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  workspace?: string;
  permissions: Permission[];
  usersCount: number;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface RoleWithUsers extends Role {
  assignedUsers: User[];
}

// Permission Management Types
export interface PermissionModule {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface PermissionMatrix {
  roles: Role[];
  modules: PermissionModule[];
  assignments: Record<string, Record<string, boolean>>; // roleId -> permissionId -> assigned
}

// Audit Log Types
export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'login' | 'logout' | 'import' | 'export'
  | 'assign' | 'unassign' | 'grant' | 'revoke'
  | 'activate' | 'deactivate' | 'suspend' | 'restore';

export type AuditModule = 
  | 'users' | 'roles' | 'permissions' | 'workspace'
  | 'organization' | 'department' | 'team' | 'member'
  | 'project' | 'task' | 'document' | 'knowledge'
  | 'notification' | 'report' | 'settings';

export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditResult = 'success' | 'failure' | 'partial';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId: string;
  entityName?: string;
  workspace?: string;
  department?: string;
  severity: AuditSeverity;
  result: AuditResult;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

// Filter Types
export interface UserFilter {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  department?: string;
  team?: string;
  workspace?: string;
  dateJoinedFrom?: string;
  dateJoinedTo?: string;
  sortBy?: 'name' | 'email' | 'joined' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditFilter {
  search?: string;
  user?: string;
  module?: AuditModule;
  action?: AuditAction;
  workspace?: string;
  department?: string;
  severity?: AuditSeverity;
  result?: AuditResult;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'timestamp' | 'user' | 'action';
  sortOrder?: 'asc' | 'desc';
}

// Permission Check Type
export interface PermissionCheck {
  module: string;
  action: string;
  resource?: string;
  granted: boolean;
}

// Administration Panel Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentAuditLogs: AuditLog[];
  recentActions: AuditLog[];
}
