export type {
  ApiResponse,
  ApiErrorResponse,
  FieldError,
  Pageable,
  PageMetadata,
  PageResponse,
  SortDirection,
  SortField,
  FilterCriterion,
  FilterGroup,
  QueryState,
  MutationState,
} from './api';

export type { NormalizedApiError } from '../lib/api';

export {
  buildPageable,
  buildSearchParams,
  DEFAULT_PAGEABLE,
} from './api';

/* ================================================================
 * Backend DTOs — matching com.trio.backend.dto.*
 * ================================================================ */

/* ---------- Enums matching backend ---------- */

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum UserStatus {
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
  SOFT_DELETED = 'SOFT_DELETED',
}

export enum MemberType {
  EMPLOYEE = 'EMPLOYEE',
  INTERN = 'INTERN',
  COMMERCIAL = 'COMMERCIAL',
}

/* ---------- Auth DTOs ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteActivationRequest {
  activationToken: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* ---------- User DTOs ---------- */

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberType: MemberType;
  role: RoleName;
  status: UserStatus;
  profilePicture?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
}

export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  memberType: MemberType;
  role: RoleName;
  status: UserStatus;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  memberType: MemberType;
  role: RoleName;
  departmentId?: string;
  teamId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  memberType?: MemberType;
  role?: RoleName;
  status?: UserStatus;
  departmentId?: string | null;
  teamId?: string;
  removeTeam?: boolean;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface AssignRolesRequest {
  roles: RoleName[];
}

export interface UserSearchCriteria {
  keyword?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: UserStatus;
  statuses?: UserStatus[];
  role?: RoleName;
  departmentId?: string;
  teamId?: string;
  memberType?: MemberType;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  excludeSoftDeleted?: boolean;
}

export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  archivedUsers: number;
  softDeletedUsers: number;
  pendingActivationUsers: number;
  lockedUsers: number;
  usersPerDepartment: Record<string, number>;
  usersPerTeam: Record<string, number>;
  usersPerRole: Record<string, number>;
  recentHires: number;
}

/* ---------- Role DTOs ---------- */

export interface RoleResponse {
  id: string;
  name: RoleName;
  description: string;
  permissions?: string[];
  userCount?: number;
}

/* ---------- Permission DTOs ---------- */

export interface PermissionResponse {
  id: string;
  code: string;
  displayName: string;
  description: string;
}

/* ---------- User History DTOs ---------- */

export interface UserHistoryResponse {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  workspaceId: string;
  workspaceName: string;
  performedById: string;
  performedByEmail: string;
  performedByName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  createdAt: string;
}

export interface UserHistorySearchCriteria {
  userId?: string;
  actions?: string[];
  action?: string;
  performedBy?: string;
  departmentId?: string;
  createdAfter?: string;
  createdBefore?: string;
  keyword?: string;
}
