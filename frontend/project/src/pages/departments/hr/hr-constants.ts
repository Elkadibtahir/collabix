export const CANDIDATE_STATUSES = [
  'APPLIED', 'CV_REVIEW', 'HR_INTERVIEW', 'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN',
] as const;

export const candidateStatusColor: Record<string, string> = {
  APPLIED: 'info',
  CV_REVIEW: 'neutral',
  HR_INTERVIEW: 'accent',
  TECHNICAL_INTERVIEW: 'accent',
  FINAL_INTERVIEW: 'warning',
  OFFER: 'success',
  HIRED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export const candidateStatusLabel: Record<string, string> = {
  APPLIED: 'Applied',
  CV_REVIEW: 'CV Review',
  HR_INTERVIEW: 'HR Interview',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const CANDIDATE_SOURCES = [
  'LINKEDIN', 'REFERRAL', 'COMPANY_WEBSITE', 'JOB_BOARD', 'RECRUITER', 'OTHER',
] as const;

export const candidateSourceLabel: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  REFERRAL: 'Referral',
  COMPANY_WEBSITE: 'Company Website',
  JOB_BOARD: 'Job Board',
  RECRUITER: 'Recruiter',
  OTHER: 'Other',
};

export const CONTRACT_TYPES = [
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY',
] as const;

export const contractTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
};

export const contractTypeColor: Record<string, string> = {
  FULL_TIME: 'accent',
  PART_TIME: 'info',
  CONTRACT: 'warning',
  INTERNSHIP: 'success',
  FREELANCE: 'neutral',
  TEMPORARY: 'neutral',
};

export const EMPLOYMENT_STATUSES = [
  'ONBOARDING', 'PROBATION', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED',
] as const;

export const employmentStatusLabel: Record<string, string> = {
  ONBOARDING: 'Onboarding',
  PROBATION: 'Probation',
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
  RESIGNED: 'Resigned',
  TERMINATED: 'Terminated',
  RETIRED: 'Retired',
};

export const employmentStatusColor: Record<string, string> = {
  ONBOARDING: 'info',
  PROBATION: 'warning',
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  SUSPENDED: 'danger',
  RESIGNED: 'neutral',
  TERMINATED: 'danger',
  RETIRED: 'neutral',
};

export const SKILL_CATEGORIES = [
  'TECHNICAL', 'PROGRAMMING', 'DATABASE', 'DEVOPS', 'CLOUD', 'AI', 'MARKETING', 'DESIGN',
  'MANAGEMENT', 'COMMUNICATION', 'LANGUAGE', 'SALES', 'HR', 'FINANCE', 'OTHER',
] as const;

export const skillCategoryLabel: Record<string, string> = {
  TECHNICAL: 'Technical',
  PROGRAMMING: 'Programming',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  CLOUD: 'Cloud',
  AI: 'AI',
  MARKETING: 'Marketing',
  DESIGN: 'Design',
  MANAGEMENT: 'Management',
  COMMUNICATION: 'Communication',
  LANGUAGE: 'Language',
  SALES: 'Sales',
  HR: 'HR',
  FINANCE: 'Finance',
  OTHER: 'Other',
};

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

export const skillLevelColor: Record<string, string> = {
  BEGINNER: 'info',
  INTERMEDIATE: 'warning',
  ADVANCED: 'success',
  EXPERT: 'accent',
};

export const ONBOARDING_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'] as const;

export const onboardingStatusColor: Record<string, string> = {
  NOT_STARTED: 'neutral',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  ON_HOLD: 'info',
};

export const ONBOARDING_TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] as const;

export const onboardingTaskStatusColor: Record<string, string> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  SKIPPED: 'neutral',
};

export const REVIEW_STATUSES = ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ARCHIVED'] as const;

export const reviewStatusColor: Record<string, string> = {
  DRAFT: 'neutral',
  IN_PROGRESS: 'info',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  ARCHIVED: 'neutral',
};

export const PERFORMANCE_LEVELS = [
  'OUTSTANDING', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY',
] as const;

export const performanceLevelColor: Record<string, string> = {
  OUTSTANDING: 'success',
  EXCELLENT: 'success',
  VERY_GOOD: 'info',
  GOOD: 'info',
  SATISFACTORY: 'warning',
  NEEDS_IMPROVEMENT: 'danger',
  UNSATISFACTORY: 'danger',
};

export const REVIEW_PERIODS = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'CUSTOM'] as const;

export const reviewPeriodLabel: Record<string, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual',
  ANNUAL: 'Annual',
  CUSTOM: 'Custom',
};

export const INTERVIEW_TYPES = ['HR', 'TECHNICAL', 'MANAGERIAL', 'FINAL', 'CUSTOM'] as const;

export const interviewTypeColor: Record<string, string> = {
  HR: 'info',
  TECHNICAL: 'accent',
  MANAGERIAL: 'warning',
  FINAL: 'success',
  CUSTOM: 'neutral',
};

export const INTERVIEW_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'] as const;

export const interviewStatusColor: Record<string, string> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  RESCHEDULED: 'warning',
  NO_SHOW: 'danger',
};

export const RECOMMENDATIONS = ['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'] as const;

export const recommendationColor: Record<string, string> = {
  STRONG_HIRE: 'success',
  HIRE: 'success',
  NEUTRAL: 'neutral',
  NO_HIRE: 'danger',
  STRONG_NO_HIRE: 'danger',
};

export const ATTENDANCE_STATUSES = [
  'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'REMOTE', 'VACATION', 'SICK_LEAVE', 'BUSINESS_TRIP', 'HOLIDAY',
] as const;

export const attendanceStatusColor: Record<string, string> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  HALF_DAY: 'info',
  REMOTE: 'accent',
  VACATION: 'info',
  SICK_LEAVE: 'warning',
  BUSINESS_TRIP: 'neutral',
  HOLIDAY: 'neutral',
};

export const NOTE_CATEGORIES = ['GENERAL', 'HR', 'TECHNICAL', 'INTERVIEW', 'SALARY', 'RISK', 'FOLLOW_UP', 'OFFER', 'OTHER'] as const;

export const noteCategoryLabel: Record<string, string> = {
  GENERAL: 'General',
  HR: 'HR',
  TECHNICAL: 'Technical',
  INTERVIEW: 'Interview',
  SALARY: 'Salary',
  RISK: 'Risk',
  FOLLOW_UP: 'Follow Up',
  OFFER: 'Offer',
  OTHER: 'Other',
};

export const NOTE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const notePriorityColor: Record<string, string> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

export const NOTE_VISIBILITIES = ['PRIVATE', 'DEPARTMENT', 'MANAGERS'] as const;

export const noteVisibilityLabel: Record<string, string> = {
  PRIVATE: 'Private',
  DEPARTMENT: 'Department',
  MANAGERS: 'Managers',
};

export const EMPLOYEE_DOCUMENT_TYPES = [
  'CONTRACT', 'NDA', 'IDENTITY', 'PASSPORT', 'WORK_PERMIT', 'DIPLOMA', 'CERTIFICATE', 'RESUME',
  'PERFORMANCE_REVIEW', 'PROMOTION', 'SALARY', 'MEDICAL', 'INSURANCE', 'TAX', 'RESIGNATION',
  'EXIT_DOCUMENT', 'OTHER',
] as const;

export const employeeDocumentTypeLabel: Record<string, string> = {
  CONTRACT: 'Contract',
  NDA: 'NDA',
  IDENTITY: 'Identity',
  PASSPORT: 'Passport',
  WORK_PERMIT: 'Work Permit',
  DIPLOMA: 'Diploma',
  CERTIFICATE: 'Certificate',
  RESUME: 'Resume',
  PERFORMANCE_REVIEW: 'Performance Review',
  PROMOTION: 'Promotion',
  SALARY: 'Salary',
  MEDICAL: 'Medical',
  INSURANCE: 'Insurance',
  TAX: 'Tax',
  RESIGNATION: 'Resignation',
  EXIT_DOCUMENT: 'Exit Document',
  OTHER: 'Other',
};

export const CANDIDATE_ATTACHMENT_TYPES = [
  'CV', 'COVER_LETTER', 'DIPLOMA', 'CERTIFICATE', 'PORTFOLIO', 'IDENTITY',
  'RECOMMENDATION', 'OFFER_LETTER', 'CONTRACT', 'OTHER',
] as const;

export const candidateAttachmentTypeLabel: Record<string, string> = {
  CV: 'CV',
  COVER_LETTER: 'Cover Letter',
  DIPLOMA: 'Diploma',
  CERTIFICATE: 'Certificate',
  PORTFOLIO: 'Portfolio',
  IDENTITY: 'Identity',
  RECOMMENDATION: 'Recommendation',
  OFFER_LETTER: 'Offer Letter',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

export function formatEnum(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/_/g, ' ');
}

export function formatDateTime(value: string | undefined | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value: string | undefined | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
