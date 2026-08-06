import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, PieChart } from '../../../components/ui/Charts';
import { Loader2 } from 'lucide-react';
import { useEmployeeStats } from '../../../services/employee-hooks';
import { useCandidateStats } from '../../../services/candidate-hooks';
import { useAttendanceStats } from '../../../services/attendance-hooks';
import { usePerformanceReviewStats } from '../../../services/performance-review-hooks';
import { useOnboardingStats } from '../../../services/onboarding-hooks';
import { useEmployeeSkillStats } from '../../../services/employee-skill-hooks';
import { useEmployeeDocumentStats } from '../../../services/employee-document-hooks';
import { candidateStatusLabel, contractTypeLabel, employmentStatusLabel, skillCategoryLabel, employeeDocumentTypeLabel, formatEnum } from './hr-constants';

function toBar(data: Record<string, number>, labelFn: (k: string) => string): { label: string; value: number }[] {
  return Object.entries(data)
    .map(([k, v]) => ({ label: labelFn(k), value: v }))
    .sort((a, b) => b.value - a.value);
}

export function HrReportsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: emp, isLoading: empLoading } = useEmployeeStats(wsId, deptId);
  const { data: cand, isLoading: candLoading } = useCandidateStats(wsId, deptId);
  const { data: att, isLoading: attLoading } = useAttendanceStats(wsId, deptId);
  const { data: review, isLoading: reviewLoading } = usePerformanceReviewStats(wsId, deptId);
  const { data: onb, isLoading: onbLoading } = useOnboardingStats(wsId, deptId);
  const { data: skill, isLoading: skillLoading } = useEmployeeSkillStats(wsId, deptId);
  const { data: docs, isLoading: docsLoading } = useEmployeeDocumentStats(wsId, deptId, undefined);

  if (empLoading || candLoading || attLoading || reviewLoading || onbLoading || skillLoading || docsLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <ReportStat label="Total Employees" value={emp?.totalEmployees ?? 0} />
        <ReportStat label="Active Employees" value={emp?.activeEmployees ?? 0} />
        <ReportStat label="Total Candidates" value={cand?.totalCandidates ?? 0} />
        <ReportStat label="Hired" value={cand?.hiredCount ?? 0} />
        <ReportStat label="Attendance Rate" value={`${att?.attendanceRate.toFixed(1) ?? '0'}%`} />
        <ReportStat label="Avg Review Score" value={`${review?.averageDepartmentScore.toFixed(1) ?? '0'}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Headcount by Employment Status</CardTitle></CardHeader>
          <CardBody>
            {emp && Object.keys(emp.employeesByStatus).length > 0 ? (
              <BarChart data={toBar(emp.employeesByStatus, (k) => employmentStatusLabel[k] ?? formatEnum(k))} height={200} tone="accent" />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Headcount by Employment Type</CardTitle></CardHeader>
          <CardBody>
            {emp && Object.keys(emp.employeesByEmploymentType).length > 0 ? (
              <PieChart data={toBar(emp.employeesByEmploymentType, (k) => contractTypeLabel[k] ?? formatEnum(k)).map((d, i) => ({ ...d, tone: (['accent', 'success', 'warning', 'info', 'neutral', 'danger'] as const)[i % 6] }))} size={150} />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hiring Pipeline (Candidates by Status)</CardTitle></CardHeader>
          <CardBody>
            {cand && Object.keys(cand.candidatesPerStatus).length > 0 ? (
              <BarChart data={toBar(cand.candidatesPerStatus, (k) => candidateStatusLabel[k] ?? formatEnum(k))} height={200} tone="info" />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance by Status</CardTitle></CardHeader>
          <CardBody>
            {att && Object.keys(att.attendanceByStatus).length > 0 ? (
              <BarChart data={toBar(att.attendanceByStatus, (k) => formatEnum(k))} height={200} tone="success" />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Onboarding by Status</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {onb && Object.keys(onb.onboardingsByStatus).length > 0 ? (
              <BarChart data={toBar(onb.onboardingsByStatus, (k) => formatEnum(k))} height={160} tone="warning" />
            ) : <Empty />}
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Completion Rate" value={`${onb?.completionRate.toFixed(0) ?? 0}%`} />
              <MiniStat label="Avg Completion (days)" value={onb ? onb.averageCompletionDays.toFixed(1) : '0'} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skills by Category</CardTitle></CardHeader>
          <CardBody>
            {skill && Object.keys(skill.skillsByCategory).length > 0 ? (
              <PieChart data={toBar(skill.skillsByCategory, (k) => skillCategoryLabel[k] ?? formatEnum(k)).map((d, i) => ({ ...d, tone: (['accent', 'success', 'warning', 'info', 'neutral', 'danger'] as const)[i % 6] }))} size={150} />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Documents Report</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {docs && Object.keys(docs.documentsByType).length > 0 ? (
              <BarChart data={toBar(docs.documentsByType, (k) => employeeDocumentTypeLabel[k] ?? formatEnum(k))} height={160} tone="warning" />
            ) : <Empty />}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Total" value={docs?.totalDocuments ?? 0} />
              <MiniStat label="Verified" value={docs?.verifiedCount ?? 0} />
              <MiniStat label="Unverified" value={docs?.unverifiedCount ?? 0} />
              <MiniStat label="Expiring" value={docs?.expiringCount ?? 0} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance Report</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Total Reviews" value={review?.totalReviews ?? 0} />
              <MiniStat label="Dept Avg" value={`${review?.averageDepartmentScore.toFixed(1) ?? '0'}%`} />
              <MiniStat label="Highest" value={`${review?.highestScore.toFixed(1) ?? '0'}%`} />
              <MiniStat label="Lowest" value={`${review?.lowestScore.toFixed(1) ?? '0'}%`} />
            </div>
            {review && Object.keys(review.averageScorePerCriterion).length > 0 && (
              <div>
                <p className="text-caption font-medium text-text-secondary mb-2">Average Score Per Criterion</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(review.averageScorePerCriterion).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between p-2 rounded border border-border-subtle">
                      <span className="text-2xs text-text-tertiary">{formatEnum(k)}</span>
                      <span className="text-caption font-medium text-text-primary">{typeof v === 'number' ? v.toFixed(1) : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
      </CardBody>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
      <span className="text-2xs text-text-tertiary">{label}</span>
      <span className="text-section font-bold text-text-primary">{value}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-caption text-text-tertiary py-8 text-center">No data available yet.</p>;
}
