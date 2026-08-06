import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface PerformanceReviewResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  reviewerId: string;
  reviewerName: string;
  teamId?: string;
  teamName?: string;
  reviewPeriod: string;
  reviewDate: string;
  dueDate?: string;
  status: string;
  objectivesAchieved: number;
  technicalSkills: number;
  softSkills: number;
  punctualityAttendance: number;
  teamwork: number;
  initiativeProblemSolving: number;
  communication: number;
  continuousLearningAdaptability: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  averageScore: number;
  performanceLevel: string;
  generalComment?: string;
  managerComment?: string;
  employeeComment?: string;
  strengths?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  promotionRecommended?: boolean;
  salaryIncreaseRecommended?: boolean;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerformanceReviewRequest {
  employeeId: string;
  reviewerId: string;
  teamId?: string;
  reviewPeriod: string;
  reviewDate: string;
  dueDate?: string;
  objectivesAchieved: number;
  technicalSkills: number;
  softSkills: number;
  punctualityAttendance: number;
  teamwork: number;
  initiativeProblemSolving: number;
  communication: number;
  continuousLearningAdaptability: number;
  generalComment?: string;
  strengths?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  promotionRecommended?: boolean;
  salaryIncreaseRecommended?: boolean;
}

export interface UpdatePerformanceReviewRequest {
  reviewerId?: string;
  teamId?: string;
  reviewPeriod?: string;
  reviewDate?: string;
  dueDate?: string;
  objectivesAchieved?: number;
  technicalSkills?: number;
  softSkills?: number;
  punctualityAttendance?: number;
  teamwork?: number;
  initiativeProblemSolving?: number;
  communication?: number;
  continuousLearningAdaptability?: number;
  generalComment?: string;
  managerComment?: string;
  employeeComment?: string;
  strengths?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  promotionRecommended?: boolean;
  salaryIncreaseRecommended?: boolean;
}

export interface PerformanceReviewStatistics {
  totalReviews: number;
  averageCompanyScore: number;
  averageDepartmentScore: number;
  averageTeamScore: number;
  highestScore: number;
  lowestScore: number;
  outstandingEmployees: number;
  needsImprovementEmployees: number;
  averageScorePerCriterion: Record<string, number>;
}

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/performance-reviews`;
}

export const performanceReviewService = {
  list: (wsId: string, deptId: string, params?: { page?: number; size?: number; keyword?: string; status?: string; employeeId?: string; reviewerId?: string; reviewPeriod?: string }) =>
    apiClient.get<PageResponse<PerformanceReviewResponse>>(`${base(wsId, deptId)}`, { params }),

  getById: (wsId: string, deptId: string, reviewId: string) =>
    apiClient.get<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}`),

  create: (wsId: string, deptId: string, data: CreatePerformanceReviewRequest) =>
    apiClient.post<PerformanceReviewResponse>(`${base(wsId, deptId)}`, data),

  update: (wsId: string, deptId: string, reviewId: string, data: UpdatePerformanceReviewRequest) =>
    apiClient.put<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}`, data),

  delete: (wsId: string, deptId: string, reviewId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${reviewId}`),

  submit: (wsId: string, deptId: string, reviewId: string) =>
    apiClient.put<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}/submit`),

  approve: (wsId: string, deptId: string, reviewId: string) =>
    apiClient.put<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}/approve`),

  reject: (wsId: string, deptId: string, reviewId: string, reason: string) =>
    apiClient.put<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}/reject?reason=${encodeURIComponent(reason)}`),

  archive: (wsId: string, deptId: string, reviewId: string) =>
    apiClient.put<PerformanceReviewResponse>(`${base(wsId, deptId)}/${reviewId}/archive`),

  getStats: (wsId: string, deptId: string) =>
    apiClient.get<PerformanceReviewStatistics>(`${base(wsId, deptId)}/stats`),
};
