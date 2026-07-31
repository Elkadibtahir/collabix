import { BarChart3, TrendingUp, PieChart, Activity, LineChart, Grid3X3 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { chartTypes } from './AIReportViewerTypes';

export function AIReportViewerCharts() {
  const icons = [BarChart3, TrendingUp, PieChart, Activity, LineChart, Grid3X3];
  const colors = [
    'text-accent-500 bg-accent-50 dark:bg-accent-100/10',
    'text-success-500 bg-success-50 dark:bg-success-500/10',
    'text-info-500 bg-info-50 dark:bg-info-500/10',
    'text-warning-500 bg-warning-50 dark:bg-warning-500/10',
    'text-danger-500 bg-danger-50 dark:bg-danger-500/10',
    'text-text-tertiary bg-surface-2',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-text-tertiary" />
        <h3 className="text-caption font-semibold text-text-primary">Charts & Visualizations</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chartTypes.map((chart, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div
              key={chart.id}
              className="flex items-start gap-3 rounded-xl border border-border-subtle bg-elevated dark:bg-surface p-4"
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colors[i])}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-caption font-medium text-text-primary">{chart.label}</p>
                <p className="text-2xs text-text-tertiary mt-0.5">{chart.description}</p>
                <div className="mt-2 h-12 rounded-md bg-surface-2 flex items-center justify-center">
                  <span className="text-2xs text-text-tertiary">Chart placeholder</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
