import { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Users,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Dropdown } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { workloadMetrics } from './analytics-data';

export function WorkloadAnalyticsPage({ onBack }: { onBack?: () => void }) {
  const [viewBy] = useState<'department' | 'team' | 'project'>('department');

  const overloadedMembers: { name: string; workload: number; tasks: number; capacity: number }[] = [];
  const departmentWorkload: { name: string; assigned: number; completed: number; pending: number; blocked: number; capacity: number }[] = [];
  const teamWorkload: { name: string; assigned: number; available: number; utilization: number }[] = [];

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
          <h1 className="text-page font-semibold text-text-primary">Workload Analytics</h1>
          <p className="text-body text-text-secondary">
            Monitor team capacity, task distribution, and resource utilization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total Capacity" value={workloadMetrics.capacity} icon="📊" />
        <MetricCard label="Assigned Tasks" value={workloadMetrics.assignedTasks} icon="📋" />
        <MetricCard label="Completed" value={workloadMetrics.completedTasks} icon="✅" />
        <MetricCard label="Pending" value={workloadMetrics.pendingTasks} icon="⏳" />
        <MetricCard label="Blocked" value={workloadMetrics.blockedTasks} icon="🚫" />
        <MetricCard label="Overloaded" value={workloadMetrics.overloadedMembers} icon="⚠️" />
        <MetricCard label="Available Capacity" value={`${workloadMetrics.availableCapacity}%`} icon="📈" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Overloaded Members
          </CardTitle>
        </CardHeader>
        <CardBody>
          {overloadedMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Member</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Workload</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Tasks</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Capacity</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overloadedMembers.map((member) => (
                    <tr key={member.name} className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 text-body font-medium text-text-primary">{member.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone="danger" variant="soft">{member.workload}%</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-body text-text-primary">{member.tasks}</td>
                      <td className="px-4 py-3 text-right text-body text-text-primary">{member.capacity}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone="danger" variant="soft" dot>Overloaded</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<AlertCircle className="h-6 w-6" />}
              title="No overloaded members"
              description="Team workload data will appear once tasks are assigned and tracked."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {viewBy === 'department' ? 'Department' : viewBy === 'team' ? 'Team' : 'Project'} Workload
          </CardTitle>
        </CardHeader>
        <CardBody>
          {viewBy === 'department' && departmentWorkload.length > 0 ? (
            <div className="space-y-4">
              {departmentWorkload.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-body font-medium text-text-primary">{dept.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xs text-text-tertiary">Capacity: {dept.capacity}</span>
                      <Badge tone="neutral" variant="soft">{dept.assigned} assigned</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="No workload data"
              description="Workload distribution data will be available once the backend provides analytics."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number | string; icon?: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-3">
      <div className="flex items-start justify-between mb-2">
        <p className="text-2xs text-text-tertiary font-medium">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-section font-bold text-text-primary">{value}</p>
    </div>
  );
}
