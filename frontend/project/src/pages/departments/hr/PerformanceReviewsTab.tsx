import { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { EmptyState } from '../../../components/ui/EmptyState';
import { usePerformanceReviewsList, useCreatePerformanceReview, useSubmitPerformanceReview, useApprovePerformanceReview } from '../../../services/performance-review-hooks';

const statusColors: Record<string, string> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  ARCHIVED: 'neutral',
};

const levelColors: Record<string, string> = {
  EXCELLENT: 'success',
  GOOD: 'info',
  AVERAGE: 'warning',
  BELOW_AVERAGE: 'danger',
  POOR: 'danger',
};

export function PerformanceReviewsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = usePerformanceReviewsList(wsId, deptId);
  const submitReview = useSubmitPerformanceReview(wsId, deptId);
  const approveReview = useApprovePerformanceReview(wsId, deptId);

  const reviews = data?.content ?? [];

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.employeeName?.toLowerCase().includes(q) || r.reviewerName?.toLowerCase().includes(q) || r.reviewPeriod?.toLowerCase().includes(q);
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-body font-medium text-danger-600">Failed to load performance reviews</p><p className="text-caption text-text-tertiary">Please try again later.</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search reviews..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search />} title="No performance reviews found" description="Create reviews to evaluate employee performance." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-text-primary">{r.employeeName}</p>
                      <Badge tone={(levelColors[r.performanceLevel] ?? 'neutral') as any} variant="soft">{r.performanceLevel}</Badge>
                    </div>
                    <p className="text-caption text-text-tertiary">Reviewer: {r.reviewerName}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={(statusColors[r.status] ?? 'neutral') as any} variant="soft">{r.status}</Badge>
                    <p className="text-2xs text-text-tertiary mt-1">{r.reviewPeriod}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Criterion label="Objectives" value={r.objectivesAchieved} max={20} />
                  <Criterion label="Technical" value={r.technicalSkills} max={20} />
                  <Criterion label="Soft Skills" value={r.softSkills} max={20} />
                  <Criterion label="Punctuality" value={r.punctualityAttendance} max={20} />
                  <Criterion label="Teamwork" value={r.teamwork} max={20} />
                  <Criterion label="Initiative" value={r.initiativeProblemSolving} max={20} />
                  <Criterion label="Communication" value={r.communication} max={20} />
                  <Criterion label="Adaptability" value={r.continuousLearningAdaptability} max={20} />
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-border-subtle">
                  <div>
                    <span className="text-2xs text-text-tertiary">Total Score</span>
                    <p className="text-body font-bold text-text-primary">{r.totalScore}/{r.maxScore}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Progress value={r.percentage ?? 0} size="sm" tone={(r.percentage ?? 0) >= 80 ? 'success' : (r.percentage ?? 0) >= 60 ? 'warning' : 'danger'} />
                      <span className="text-caption font-medium text-text-primary">{(r.percentage ?? 0).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.status === 'DRAFT' && (
                      <Button size="sm" variant="outline" onClick={() => submitReview.mutate(r.id)}>
                        Submit
                      </Button>
                    )}
                    {r.status === 'SUBMITTED' && (
                      <Button size="sm" variant="outline" className="text-success-600" onClick={() => approveReview.mutate(r.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Criterion({ label, value, max }: { label: string; value?: number; max: number }) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col gap-1 p-2 rounded border border-border-subtle">
      <div className="flex items-center justify-between">
        <span className="text-2xs text-text-tertiary">{label}</span>
        <span className="text-2xs font-medium text-text-primary">{value ?? '-'}/{max}</span>
      </div>
      <Progress value={pct} size="xs" tone={pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger'} />
    </div>
  );
}
