import { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  LineChart,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Dropdown } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { productivityMetrics } from './analytics-data';

export function ProductivityAnalyticsPage({ onBack }: { onBack?: () => void }) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const productivityTrend: { week: string; value: number; target: number }[] = [];
  const memberProductivity: { name: string; completed: number; velocity: number; efficiency: number }[] = [];
  const departmentProductivity: { department: string; completed: number; rate: number; efficiency: number }[] = [];

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
          <h1 className="text-page font-semibold text-text-primary">Productivity Analytics</h1>
          <p className="text-body text-text-secondary">
            Detailed insights into task completion, velocity, and team efficiency.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Dropdown
          trigger={
            <Button variant="outline">
              {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : dateRange === 'quarter' ? 'This Quarter' : 'This Year'}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'This Week', onClick: () => setDateRange('week') },
            { label: 'This Month', onClick: () => setDateRange('month') },
            { label: 'This Quarter', onClick: () => setDateRange('quarter') },
            { label: 'This Year', onClick: () => setDateRange('year') },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Tasks Completed" value={productivityMetrics.tasksCompleted} icon="✅" />
        <KPICard label="Completion Time" value={`${productivityMetrics.averageCompletionTime} days`} icon="⏱️" />
        <KPICard label="Daily Output" value={productivityMetrics.dailyProductivity} icon="📊" />
        <KPICard label="Weekly Output" value={productivityMetrics.weeklyProductivity} icon="📈" />
        <KPICard label="Monthly Output" value={productivityMetrics.monthlyProductivity} icon="📉" />
        <KPICard label="Avg per Member" value={productivityMetrics.tasksPerMember.toFixed(1)} icon="👤" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Productivity Trend vs Target
          </CardTitle>
        </CardHeader>
        <CardBody>
          {productivityTrend.length > 0 ? (
            <div className="space-y-4">
              {productivityTrend.map((item) => (
                <div key={item.week}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-medium text-text-primary">{item.week}</span>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-body font-bold text-text-primary">{item.value}%</p>
                        <p className="text-2xs text-text-tertiary">Actual</p>
                      </div>
                      <div className="text-center">
                        <p className="text-body font-medium text-text-secondary">{item.target}%</p>
                        <p className="text-2xs text-text-tertiary">Target</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title="No productivity data available"
              description="Productivity trends will appear once task data is available from the backend."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardBody>
          {memberProductivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Member</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Completed</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Velocity</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {memberProductivity.map((member, idx) => (
                    <tr key={member.name} className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white text-2xs font-bold">{idx + 1}</div>
                          <span className="text-body font-medium text-text-primary">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-body font-semibold text-text-primary">{member.completed}</td>
                      <td className="px-4 py-3 text-right text-body font-medium text-text-primary">{member.velocity}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-success-500" style={{ width: `${member.efficiency}%` }} />
                          </div>
                          <span className="text-body font-semibold text-text-primary w-8 text-right">{member.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No member productivity data"
              description="Individual productivity metrics will appear once tasks are completed."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Department Productivity Comparison
          </CardTitle>
        </CardHeader>
        <CardBody>
          {departmentProductivity.length > 0 ? (
            <div className="space-y-4">
              {departmentProductivity.map((dept) => (
                <div key={dept.department}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-body font-medium text-text-primary">{dept.department}</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-body font-bold text-text-primary">{dept.completed}</p>
                        <p className="text-2xs text-text-tertiary">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-body font-bold text-text-primary">{dept.rate}%</p>
                        <p className="text-2xs text-text-tertiary">Rate</p>
                      </div>
                      <Badge tone="success" variant="soft">{dept.efficiency}% efficiency</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="No department productivity data"
              description="Department comparisons will become available as more data is collected."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-caption text-text-tertiary">Insights will be generated once sufficient data is available.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function KPICard({ label, value, icon }: { label: string; value: number | string; icon?: string }) {
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
