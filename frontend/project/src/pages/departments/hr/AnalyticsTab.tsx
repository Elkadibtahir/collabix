import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, PieChart } from '../../../components/ui/Charts';
import { Loader2, TrendingUp, Users, Star, CalendarClock } from 'lucide-react';
import { useEmployeeStats } from '../../../services/employee-hooks';
import { useCandidateStats } from '../../../services/candidate-hooks';
import { useInterviewStats } from '../../../services/interview-hooks';
import { useAttendanceStats } from '../../../services/attendance-hooks';
import { usePerformanceReviewStats } from '../../../services/performance-review-hooks';
import { useEmployeeSkillStats } from '../../../services/employee-skill-hooks';
import { candidateStatusLabel, employmentStatusLabel, contractTypeLabel, skillCategoryLabel, formatEnum } from './hr-constants';

const tones = ['accent', 'success', 'warning', 'info', 'neutral', 'danger'] as const;

function toData(data: Record<string, number>, labelFn: (k: string) => string): { label: string; value: number }[] {
  return Object.entries(data)
    .map(([k, v]) => ({ label: labelFn(k), value: v }))
    .sort((a, b) => b.value - a.value);
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardBody className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4 shrink-0">{icon}</span>
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
          <p className="text-page font-semibold text-text-primary leading-tight">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone?: 'success' | 'danger' | 'warning' | 'info' | 'accent' }) {
  const color = tone === 'success' ? 'text-success-600' : tone === 'danger' ? 'text-danger-600' : tone === 'warning' ? 'text-warning-600' : tone === 'info' ? 'text-info-600' : tone === 'accent' ? 'text-accent-600' : 'text-text-primary';
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
      <span className="text-2xs text-text-tertiary">{label}</span>
      <span className={`text-section font-bold ${color}`}>{value}</span>
    </div>
  );
}

export function HrAnalyticsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: emp, isLoading: empLoading } = useEmployeeStats(wsId, deptId);
  const { data: cand, isLoading: candLoading } = useCandidateStats(wsId, deptId);
  const { data: iv, isLoading: ivLoading } = useInterviewStats(wsId, deptId);
  const { data: att, isLoading: attLoading } = useAttendanceStats(wsId, deptId);
  const { data: review, isLoading: reviewLoading } = usePerformanceReviewStats(wsId, deptId);
  const { data: skill, isLoading: skillLoading } = useEmployeeSkillStats(wsId, deptId);

  if (empLoading || candLoading || ivLoading || attLoading || reviewLoading || skillLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  const conversionRate = cand && cand.totalCandidates > 0 ? ((cand.hiredCount / cand.totalCandidates) * 100).toFixed(1) : '0.0';
  const retentionRate = emp && emp.totalEmployees > 0 ? ((emp.activeEmployees / emp.totalEmployees) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<TrendingUp />} label="Hiring Conversion" value={`${conversionRate}%`} />
        <KpiCard icon={<Users />} label="Active Headcount" value={emp?.activeEmployees ?? 0} />
        <KpiCard icon={<Users />} label="Headcount Retention" value={`${retentionRate}%`} />
        <KpiCard icon={<Star />} label="Avg Review Score" value={`${review?.averageDepartmentScore.toFixed(1) ?? '0'}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recruitment Funnel</CardTitle></CardHeader>
          <CardBody>
            {cand && Object.keys(cand.candidatesPerStatus).length > 0 ? (
              <BarChart data={toData(cand.candidatesPerStatus, (k) => candidateStatusLabel[k] ?? formatEnum(k))} height={220} tone="accent" />
            ) : <p className="text-caption text-text-tertiary py-8 text-center">No pipeline data available.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Interview Activity</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Today" value={iv?.interviewsToday ?? 0} tone="accent" />
              <MiniStat label="Upcoming" value={iv?.upcomingInterviews ?? 0} tone="info" />
              <MiniStat label="Completed" value={iv?.completedInterviews ?? 0} tone="success" />
              <MiniStat label="Cancelled" value={iv?.cancelledInterviews ?? 0} tone="danger" />
            </div>
            <BarChart
              data={[
                { label: 'Today', value: iv?.interviewsToday ?? 0 },
                { label: 'Upcoming', value: iv?.upcomingInterviews ?? 0 },
                { label: 'Completed', value: iv?.completedInterviews ?? 0 },
                { label: 'Cancelled', value: iv?.cancelledInterviews ?? 0 },
              ]}
              height={140}
              tone="info"
            />
            <div className="flex items-center gap-2 text-2xs text-text-tertiary">
              <CalendarClock className="h-4 w-4" />
              <span>Candidates waiting for interview: {iv?.candidatesWaitingForInterview ?? 0}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Employee Distribution</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <p className="text-caption font-medium text-text-secondary">By Employment Status</p>
            {emp && Object.keys(emp.employeesByStatus).length > 0 ? (
              <PieChart data={toData(emp.employeesByStatus, (k) => employmentStatusLabel[k] ?? formatEnum(k)).map((d, i) => ({ ...d, tone: tones[i % tones.length] }))} size={150} />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No employee data available.</p>}
            <p className="text-caption font-medium text-text-secondary">By Employment Type</p>
            {emp && Object.keys(emp.employeesByEmploymentType).length > 0 ? (
              <BarChart data={toData(emp.employeesByEmploymentType, (k) => contractTypeLabel[k] ?? formatEnum(k))} height={120} tone="success" />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No employee data available.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance Summary</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Present Days" value={att?.presentDays ?? 0} tone="success" />
              <MiniStat label="Absent" value={att?.absentDays ?? 0} tone="danger" />
              <MiniStat label="Late" value={att?.lateArrivals ?? 0} tone="warning" />
              <MiniStat label="Sick Leave" value={att?.sickLeaveDays ?? 0} tone="info" />
            </div>
            {att && Object.keys(att.attendanceByStatus).length > 0 ? (
              <BarChart data={toData(att.attendanceByStatus, (k) => formatEnum(k))} height={150} tone="success" />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No attendance data available.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skills Distribution</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <p className="text-caption font-medium text-text-secondary">By Proficiency Level</p>
            {skill && Object.keys(skill.skillsByLevel).length > 0 ? (
              <BarChart data={toData(skill.skillsByLevel, (k) => formatEnum(k))} height={120} tone="accent" />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No skill data available.</p>}
            <p className="text-caption font-medium text-text-secondary">By Category</p>
            {skill && Object.keys(skill.skillsByCategory).length > 0 ? (
              <PieChart data={toData(skill.skillsByCategory, (k) => skillCategoryLabel[k] ?? formatEnum(k)).map((d, i) => ({ ...d, tone: tones[i % tones.length] }))} size={150} />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No skill data available.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance Analytics</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Total Reviews" value={review?.totalReviews ?? 0} />
              <MiniStat label="Outstanding" value={review?.outstandingEmployees ?? 0} tone="success" />
              <MiniStat label="Needs Improv." value={review?.needsImprovementEmployees ?? 0} tone="danger" />
              <MiniStat label="Highest Score" value={`${review?.highestScore.toFixed(1) ?? '0'}%`} tone="accent" />
            </div>
            {review && Object.keys(review.averageScorePerCriterion).length > 0 ? (
              <BarChart data={toData(review.averageScorePerCriterion, (k) => formatEnum(k))} height={150} tone="warning" />
            ) : <p className="text-caption text-text-tertiary py-4 text-center">No review data available.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
