import { useState } from 'react';
import {
  Bell,
  BellRing,
  Save,
  Check,
  Info,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/cn';

/* ---------- Types ---------- */

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
}

interface ChannelConfig {
  inApp: boolean;
  email: boolean;
  push: boolean;
}

interface CategoryState {
  enabled: boolean;
  channels: ChannelConfig;
  frequency: string;
}

/* ---------- Data ---------- */

const categories: NotificationCategory[] = [
  { id: 'workspace', label: 'Workspace', description: 'Workspace updates and announcements', icon: BellRing },
  { id: 'projects', label: 'Projects', description: 'Project updates, milestones, and deadlines', icon: Bell },
  { id: 'tasks', label: 'Tasks', description: 'Task assignments, due dates, and changes', icon: Bell },
  { id: 'mentions', label: 'Mentions', description: 'When someone mentions you in comments', icon: Bell },
  { id: 'comments', label: 'Comments', description: 'Replies to your comments and threads', icon: Bell },
  { id: 'documents', label: 'Documents', description: 'Document shares, edits, and approvals', icon: Bell },
  { id: 'knowledge', label: 'Knowledge Base', description: 'Knowledge base article updates', icon: Bell },
  { id: 'reports', label: 'Reports', description: 'Report generation and sharing', icon: Bell },
  { id: 'security', label: 'Security', description: 'Security alerts and login activity', icon: BellRing },
  { id: 'system', label: 'System', description: 'System notifications and maintenance', icon: Bell },
];

const defaultCategories: Record<string, CategoryState> = {
  workspace: { enabled: true, channels: { inApp: true, email: true, push: false }, frequency: 'immediately' },
  projects: { enabled: true, channels: { inApp: true, email: true, push: false }, frequency: 'immediately' },
  tasks: { enabled: true, channels: { inApp: true, email: true, push: true }, frequency: 'immediately' },
  mentions: { enabled: true, channels: { inApp: true, email: true, push: true }, frequency: 'immediately' },
  comments: { enabled: true, channels: { inApp: true, email: false, push: false }, frequency: 'immediately' },
  documents: { enabled: true, channels: { inApp: true, email: true, push: false }, frequency: 'daily' },
  knowledge: { enabled: true, channels: { inApp: true, email: false, push: false }, frequency: 'weekly' },
  reports: { enabled: true, channels: { inApp: true, email: true, push: false }, frequency: 'daily' },
  security: { enabled: true, channels: { inApp: true, email: true, push: true }, frequency: 'immediately' },
  system: { enabled: true, channels: { inApp: true, email: false, push: false }, frequency: 'immediately' },
};

const frequencyOptions = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'hourly', label: 'Hourly Digest' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' },
];

/* ---------- Main page ---------- */

export function NotificationPreferencesPage() {
  const [config, setConfig] = useState<Record<string, CategoryState>>(defaultCategories);
  const [saved, setSaved] = useState(false);

  const updateCategory = (id: string, updates: Partial<CategoryState>) => {
    setConfig((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const updateChannel = (id: string, channel: keyof ChannelConfig, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        channels: { ...prev[id].channels, [channel]: value },
      },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = Object.values(config).filter((c) => c.enabled).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Notification Preferences</h1>
          <p className="text-body text-text-secondary">
            Choose what notifications you receive and how you receive them.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="flex items-center gap-1 text-caption font-medium text-success-600 animate-fade-in">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          <Button leftIcon={<Save />} onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Categories" value={`${enabledCount} active`} tone="accent" />
        <SummaryCard label="In-App" value={Object.values(config).filter((c) => c.channels.inApp).length + ' enabled'} tone="info" />
        <SummaryCard label="Email" value={Object.values(config).filter((c) => c.channels.email).length + ' enabled'} tone="success" />
        <SummaryCard label="Push" value={Object.values(config).filter((c) => c.channels.push).length + ' enabled'} tone="warning" />
      </div>

      {/* Channel headers */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_80px_140px] gap-4 px-1">
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">Category</span>
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary text-center">In-App</span>
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary text-center">Email</span>
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary text-center">Push</span>
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary text-center">Frequency</span>
      </div>

      {/* Category rows */}
      <Card>
        <CardBody className="p-0">
          {categories.map((cat, i) => {
            const state = config[cat.id];
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={cn(
                  'p-4 sm:grid sm:grid-cols-[1fr_80px_80px_80px_140px] sm:items-center gap-4',
                  i < categories.length - 1 && 'border-b border-border-subtle',
                  !state.enabled && 'opacity-50',
                )}
              >
                {/* Label */}
                <div className="flex items-center gap-3 min-w-0 mb-3 sm:mb-0">
                  <button
                    type="button"
                    onClick={() => updateCategory(cat.id, { enabled: !state.enabled })}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      state.enabled
                        ? 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300'
                        : 'bg-surface-2 text-text-tertiary',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-medium text-text-primary">{cat.label}</p>
                      {!state.enabled && <Badge tone="neutral" variant="soft" className="text-2xs">Off</Badge>}
                    </div>
                    <p className="text-caption text-text-tertiary">{cat.description}</p>
                  </div>
                </div>

                {/* In-App */}
                <div className="flex items-center justify-between sm:justify-center mb-2 sm:mb-0">
                  <span className="sm:hidden text-caption text-text-tertiary">In-App</span>
                  <Toggle
                    checked={state.channels.inApp}
                    onChange={(e) => updateChannel(cat.id, 'inApp', e.target.checked)}
                    disabled={!state.enabled}
                    size="sm"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center justify-between sm:justify-center mb-2 sm:mb-0">
                  <span className="sm:hidden text-caption text-text-tertiary">Email</span>
                  <Toggle
                    checked={state.channels.email}
                    onChange={(e) => updateChannel(cat.id, 'email', e.target.checked)}
                    disabled={!state.enabled}
                    size="sm"
                  />
                </div>

                {/* Push */}
                <div className="flex items-center justify-between sm:justify-center mb-2 sm:mb-0">
                  <span className="sm:hidden text-caption text-text-tertiary">Push</span>
                  <Toggle
                    checked={state.channels.push}
                    onChange={(e) => updateChannel(cat.id, 'push', e.target.checked)}
                    disabled={!state.enabled}
                    size="sm"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <select
                    value={state.frequency}
                    onChange={(e) => updateCategory(cat.id, { frequency: e.target.value })}
                    disabled={!state.enabled}
                    className={cn(
                      'cx-input text-caption py-1.5 w-full',
                      !state.enabled && 'opacity-50',
                    )}
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface px-3.5 py-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-text-tertiary" />
        <p className="text-caption text-text-secondary leading-relaxed">
          Push notifications are currently in development. Email and in-app notifications are delivered based on
          your frequency preferences. Critical security alerts are always sent immediately regardless of settings.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  };
  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone])}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}
