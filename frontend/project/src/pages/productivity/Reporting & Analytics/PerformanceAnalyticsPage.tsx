import { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { performanceMetrics } from './analytics-data';

export function PerformanceAnalyticsPage({ onBack }: { onBack?: () => void }) {
  const [sortBy] = useState<'performance' | 'completion' | 'deadline'>('performance');

  const departmentPerformance: { name: string; completion: number; onTime: number; quality: number; score: number }[] = [];
  const teamPerformance: { name: string; completion: number; velocity: number; quality: number }[] = [];
  const projectPerformance: { name: string; completion: number; health: string; score: number }[] = [];
  const memberRanking: { rank: number; name: string; completion: number; quality: number; reliability: number; score: number }[] = [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-page font-semibold text-text-primary">Performance Analytics</h1>
          <p className="text-body text-text-secondary">
            Track completion rates, deadline compliance, and team effectiveness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Completion Rate" value={`${performanceMetrics.taskCompletionRate}%`} icon={TrendingUp} />
        <KPICard label="Project Success" value={`${performanceMetrics.projectSuccessRate}%`} icon={Trophy} />
        <KPICard label="On-Time Delivery" value={`${performanceMetrics.deadlineCompliance}%`} icon="✅" />
        <KPICard label="Avg Delay" value={`${performanceMetrics.averageDelay} days`} icon="⏰" />
        <KPICard label="Knowledge Contributions" value={performanceMetrics.knowledgeContributions} icon="📚" />
        <KPICard label="Resolution Time" value={`${performanceMetrics.averageResolutionTime} days`} icon="⚡" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardBody>
            {departmentPerformance.length > 0 ? (
              <div className="space-y-4">
                {departmentPerformance.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body font-medium text-text-primary">{dept.name}</span>
                      <Badge tone="accent" variant="soft">{dept.score.toFixed(1)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No performance data"
                description="Department performance metrics will appear once backend data is available."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardBody>
            {teamPerformance.length > 0 ? (
              <div className="space-y-4">
                {teamPerformance.map((team) => (
                  <div key={team.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body font-medium text-text-primary">{team.name}</span>
                      <Badge tone="info" variant="soft">{team.completion}% completion</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No team data"
                description="Team performance metrics will appear once backend data is available."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
          </CardHeader>
          <CardBody>
            {projectPerformance.length > 0 ? (
              <div className="space-y-3">
                {projectPerformance.map((proj) => (
                  <div key={proj.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body font-medium text-text-primary">{proj.name}</span>
                      <Badge tone={proj.health === 'on-track' ? 'success' : 'warning'} variant="soft">
                        {proj.health}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No project data"
                description="Project performance metrics will appear once projects are created."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Rankings</CardTitle>
          </CardHeader>
          <CardBody>
            {memberRanking.length > 0 ? (
              <div className="space-y-3">
                {memberRanking.map((member) => (
                  <div key={member.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-bold text-text-tertiary w-5">#{member.rank}</span>
                      <span className="text-body font-medium text-text-primary">{member.name}</span>
                    </div>
                    <Badge tone="success" variant="soft">{member.score.toFixed(1)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Trophy className="h-6 w-6" />}
                title="No rankings yet"
                description="Member performance rankings will appear once task data is collected."
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon }: { label: string; value: string | number; icon?: React.ComponentType<{ className?: string }> | string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-3">
      <div className="flex items-start justify-between mb-2">
        <p className="text-2xs text-text-tertiary font-medium">{label}</p>
      </div>
      <p className="text-section font-bold text-text-primary">{value}</p>
    </div>
  );
}
