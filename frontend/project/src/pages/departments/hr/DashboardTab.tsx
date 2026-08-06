import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useCandidateStats, useCandidatesList } from '../../../services/candidate-hooks';
import { useEmployeeStats } from '../../../services/employee-hooks';
import { useEmployeeSkillStats } from '../../../services/employee-skill-hooks';
import { useOnboardingStats } from '../../../services/onboarding-hooks';
import { usePerformanceReviewStats } from '../../../services/performance-review-hooks';
import { useInterviewStats, useInterviewsUpcoming } from '../../../services/interview-hooks';
import { useAttendanceStats } from '../../../services/attendance-hooks';
import { Users, UserPlus, Briefcase, GraduationCap, Star, CalendarClock, Clock, Loader2, ArrowRight } from 'lucide-react';
import { candidateStatusColor, candidateStatusLabel, interviewTypeColor, formatDate, formatTime, formatEnum } from './hr-constants';

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

export function HrDashboardTab({ wsId, deptId, onNavigate }: { wsId: string; deptId: string; onNavigate?: (tab: string) => void }) {
  const { data: empStats, isLoading: empLoading } = useEmployeeStats(wsId, deptId);
  const { data: candStats, isLoading: candLoading } = useCandidateStats(wsId, deptId);
  const { data: skillStats, isLoading: skillLoading } = useEmployeeSkillStats(wsId, deptId);
  const { data: onbStats, isLoading: onbLoading } = useOnboardingStats(wsId, deptId);
  const { data: reviewStats, isLoading: reviewLoading } = usePerformanceReviewStats(wsId, deptId);
  const { data: ivStats, isLoading: ivLoading } = useInterviewStats(wsId, deptId);
  const { data: attStats, isLoading: attLoading } = useAttendanceStats(wsId, deptId);
  const { data: upcomingData, isLoading: upcomingLoading } = useInterviewsUpcoming(wsId, deptId);
  const { data: candData, isLoading: recentLoading } = useCandidatesList(wsId, deptId, 0, 5);

  if (empLoading || candLoading || skillLoading || onbLoading || reviewLoading || ivLoading || attLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  const upcoming = upcomingData ?? [];
  const recentCandidates = candData?.content ?? [];

  const quickActions = [
    { id: 'employees', label: 'Employees', icon: <Users className="h-4 w-4" /> },
    { id: 'candidates', label: 'Candidates', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'interviews', label: 'Interviews', icon: <CalendarClock className="h-4 w-4" /> },
    { id: 'onboarding', label: 'Onboarding', icon: <Star className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <Clock className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <GraduationCap className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<Users />} label="Total Employees" value={empStats?.totalEmployees ?? 0} tone="accent" />
        <StatWidget icon={<UserPlus />} label="Active Employees" value={empStats?.activeEmployees ?? 0} tone="success" />
        <StatWidget icon={<UserPlus />} label="New Hires (Month)" value={empStats?.newHiresThisMonth ?? 0} tone="info" />
        <StatWidget icon={<Users />} label="On Leave" value={empStats?.onLeaveCount ?? 0} tone="warning" />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<Briefcase />} label="Total Candidates" value={candStats?.totalCandidates ?? 0} tone="accent" />
        <StatWidget icon={<UserPlus />} label="Hired" value={candStats?.hiredCount ?? 0} tone="success" />
        <StatWidget icon={<Briefcase />} label="In Progress" value={candStats?.inProgressCount ?? 0} tone="info" />
        <StatWidget icon={<CalendarClock />} label="Interviews Today" value={ivStats?.interviewsToday ?? 0} tone="warning" />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<GraduationCap />} label="Total Skills" value={skillStats?.totalSkills ?? 0} tone="accent" />
        <StatWidget icon={<GraduationCap />} label="Certifications" value={skillStats?.certificationCount ?? 0} tone="info" />
        <StatWidget icon={<Star />} label="Active Onboardings" value={onbStats?.activeOnboardings ?? 0} tone="warning" />
        <StatWidget icon={<Star />} label="Avg Review Score" value={reviewStats ? `${reviewStats.averageDepartmentScore.toFixed(1)}%` : '0%'} tone="success" />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatWidget icon={<Clock />} label="Attendance Rate" value={attStats ? `${attStats.attendanceRate.toFixed(1)}%` : '0%'} tone="accent" />
        <StatWidget icon={<Users />} label="Present Days" value={attStats?.presentDays ?? 0} tone="success" />
        <StatWidget icon={<UserPlus />} label="Remote Days" value={attStats?.remoteWorkDays ?? 0} tone="info" />
        <StatWidget icon={<Briefcase />} label="Avg Worked Hours" value={attStats ? attStats.averageWorkedHours.toFixed(1) : '0'} tone="neutral" />
      </div>

      {onNavigate && (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-2">
            {quickActions.map((qa) => (
              <Button key={qa.id} variant="outline" size="sm" leftIcon={qa.icon} onClick={() => onNavigate(qa.id)}>
                {qa.label}
              </Button>
            ))}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardBody>
            {upcomingLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-text-tertiary" /></div>
            ) : upcoming.length === 0 ? (
              <p className="text-caption text-text-tertiary py-6 text-center">No upcoming interviews scheduled.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 5).map((iv) => (
                  <div key={iv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium text-text-primary">{formatDate(iv.scheduledDate)} {iv.startTime ? formatTime(iv.startTime) : ''}</p>
                      <p className="text-2xs text-text-tertiary">{formatEnum(iv.type)}</p>
                    </div>
                    <Badge tone={(interviewTypeColor[iv.type] ?? 'neutral') as Tone} variant="soft">{formatEnum(iv.type)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Recent Candidates</CardTitle>
          </CardHeader>
          <CardBody>
            {recentLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-text-tertiary" /></div>
            ) : recentCandidates.length === 0 ? (
              <p className="text-caption text-text-tertiary py-6 text-center">No candidates yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 text-caption font-semibold">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium text-text-primary">{c.firstName} {c.lastName}</p>
                      <p className="text-2xs text-text-tertiary">{c.position}</p>
                    </div>
                    <Badge tone={(candidateStatusColor[c.currentStatus] ?? 'neutral') as Tone} variant="soft" dot>{candidateStatusLabel[c.currentStatus] ?? formatEnum(c.currentStatus)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
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
          </CardBody>
        </Card>
      )}

      {onNavigate && (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => onNavigate('reports')}>
            Open HR Reports
          </Button>
        </div>
      )}
    </div>
  );
}
