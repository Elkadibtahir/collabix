import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useCandidateStats } from '../../../services/candidate-hooks';
import { useEmployeeStats } from '../../../services/employee-hooks';
import { useEmployeeSkillStats } from '../../../services/employee-skill-hooks';
import { useOnboardingStats } from '../../../services/onboarding-hooks';
import { usePerformanceReviewStats } from '../../../services/performance-review-hooks';
import { Users, UserPlus, Briefcase, GraduationCap, Star, BarChart3, Loader2 } from 'lucide-react';

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function StatWidget({ icon, label, value, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string | number; tone?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', statToneBg[tone])}>{icon}</span>
        </div>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
      </CardBody>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function HrDashboardTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: empStats, isLoading: empLoading } = useEmployeeStats(wsId, deptId);
  const { data: candStats, isLoading: candLoading } = useCandidateStats(wsId, deptId);
  const { data: skillStats, isLoading: skillLoading } = useEmployeeSkillStats(wsId, deptId);
  const { data: onbStats, isLoading: onbLoading } = useOnboardingStats(wsId, deptId);
  const { data: reviewStats, isLoading: reviewLoading } = usePerformanceReviewStats(wsId, deptId);

  if (empLoading || candLoading || skillLoading || onbLoading || reviewLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<Users />} label="Total Employees" value={empStats?.totalEmployees ?? 0} tone="accent" />
        <StatWidget icon={<UserPlus />} label="Active Employees" value={empStats?.activeEmployees ?? 0} tone="success" />
        <StatWidget icon={<UserPlus />} label="New Hires (Month)" value={empStats?.newHiresThisMonth ?? 0} tone="info" />
        <StatWidget icon={<Users />} label="Probation" value={empStats?.probationCount ?? 0} tone="warning" />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<Briefcase />} label="Total Candidates" value={candStats?.totalCandidates ?? 0} tone="accent" />
        <StatWidget icon={<UserPlus />} label="Hired" value={candStats?.hiredCount ?? 0} tone="success" />
        <StatWidget icon={<BarChart3 />} label="In Progress" value={candStats?.inProgressCount ?? 0} tone="info" />
        <StatWidget icon={<BarChart3 />} label="Rejected" value={candStats?.rejectedCount ?? 0} tone="warning" />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<GraduationCap />} label="Total Skills" value={skillStats?.totalSkills ?? 0} tone="accent" />
        <StatWidget icon={<GraduationCap />} label="Certifications" value={skillStats?.certificationCount ?? 0} tone="info" />
        <StatWidget icon={<Star />} label="Active Onboardings" value={onbStats?.activeOnboardings ?? 0} tone="warning" />
        <StatWidget icon={<Star />} label="Avg Reviews Score" value={reviewStats ? `${reviewStats.averageDepartmentScore.toFixed(1)}%` : '0%'} tone="success" />
      </div>

      {onbStats && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Progress</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-accent-600">{onbStats.activeOnboardings}</span>
                <span className="text-2xs text-text-tertiary">Active</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-success-600">{onbStats.completedOnboardings}</span>
                <span className="text-2xs text-text-tertiary">Completed</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-warning-600">{onbStats.overdueTasks}</span>
                <span className="text-2xs text-text-tertiary">Overdue Tasks</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-secondary">Completion Rate:</span>
              <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${onbStats.completionRate}%` }} />
              </div>
              <span className="text-caption font-medium text-text-primary">{onbStats.completionRate.toFixed(0)}%</span>
            </div>
          </CardBody>
        </Card>
      )}

      {reviewStats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
                <span className="text-2xs text-text-tertiary">Total Reviews</span>
                <span className="text-section font-bold text-text-primary">{reviewStats.totalReviews}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
                <span className="text-2xs text-text-tertiary">Dept Avg</span>
                <span className="text-section font-bold text-text-primary">{reviewStats.averageDepartmentScore.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
                <span className="text-2xs text-text-tertiary">Highest</span>
                <span className="text-section font-bold text-success-600">{reviewStats.highestScore.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
                <span className="text-2xs text-text-tertiary">Outstanding</span>
                <span className="text-section font-bold text-accent-600">{reviewStats.outstandingEmployees}</span>
              </div>
            </div>
            {reviewStats.averageScorePerCriterion && Object.keys(reviewStats.averageScorePerCriterion).length > 0 && (
              <div>
                <p className="text-caption font-medium text-text-secondary mb-2">Average Score Per Criterion</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(reviewStats.averageScorePerCriterion).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded border border-border-subtle">
                      <span className="text-2xs text-text-tertiary">{key}</span>
                      <span className="text-caption font-medium text-text-primary">{typeof val === 'number' ? val.toFixed(1) : val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
