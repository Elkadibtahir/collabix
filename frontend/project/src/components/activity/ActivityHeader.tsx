import { Activity, RefreshCw, Download } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';

interface ActivityHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onFilter: () => void;
}

export function ActivityHeader({ onRefresh, onExport }: ActivityHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-page font-bold text-text-primary tracking-tight">Activity Center</h1>
          <p className="text-caption text-text-tertiary mt-0.5">Track everything happening across your organization.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton label="Refresh activity" variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-[18px] w-[18px]" />
        </IconButton>
        <Button size="sm" variant="secondary" leftIcon={<Download />} onClick={onExport}>Export Activity</Button>
      </div>
    </div>
  );
}
