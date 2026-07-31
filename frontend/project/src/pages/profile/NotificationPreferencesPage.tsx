import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, BellOff, Mail, Smartphone, Clock, Briefcase, FolderKanban, CheckSquare, AtSign, MessageSquare, FileText, BookOpen, BarChart3, Shield, Settings, Loader2 } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Radio, RadioGroup } from '../../components/ui/Radio';
import { useNotificationPreferences, useUpdatePreference, useCreatePreference } from '../../services/notification-hooks';
import type { NotificationPreferenceResponse } from '../../services/notification-service';

type Channel = 'inApp' | 'email';
type Frequency = 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';

interface CategoryConfig {
  inApp: boolean;
  email: boolean;
  prefId?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WORKSPACE': Briefcase,
  'PROJECT': FolderKanban,
  'TASK': CheckSquare,
  'MENTION': AtSign,
  'COMMENT': MessageSquare,
  'DOCUMENT': FileText,
  'KNOWLEDGE': BookOpen,
  'REPORT': BarChart3,
  'SECURITY': Shield,
  'SYSTEM': Settings,
};

const defaultCategories: Record<string, CategoryConfig> = {
  'WORKSPACE': { inApp: true, email: true },
  'PROJECT': { inApp: true, email: true },
  'TASK': { inApp: true, email: true },
  'MENTION': { inApp: true, email: true },
  'COMMENT': { inApp: true, email: false },
  'DOCUMENT': { inApp: true, email: false },
  'KNOWLEDGE': { inApp: true, email: false },
  'REPORT': { inApp: false, email: true },
  'SECURITY': { inApp: true, email: true },
  'SYSTEM': { inApp: true, email: false },
};

export function NotificationPreferencesPage() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [categories, setCategories] = useState<Record<string, CategoryConfig>>(defaultCategories);
  const [frequency, setFrequency] = useState<Frequency>('REALTIME');
  const [error, setError] = useState('');

  const { data: prefs, isLoading } = useNotificationPreferences(wsId);
  const createPref = useCreatePreference(wsId);
  const updatePref = useUpdatePreference(wsId, '');

  useEffect(() => {
    if (!prefs) return;
    const cats = { ...defaultCategories };
    let hasFreq = false;
    prefs.forEach((p: NotificationPreferenceResponse) => {
      const type = p.notificationType;
      if (cats[type]) {
        cats[type] = { inApp: p.inAppEnabled, email: p.emailEnabled, prefId: p.id };
      }
      if (!hasFreq && p.digestFrequency) {
        setFrequency(p.digestFrequency as Frequency);
        hasFreq = true;
      }
    });
    setCategories(cats);
  }, [prefs]);

  const toggleChannel = (cat: string, channel: Channel) => {
    setCategories((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [channel]: !prev[cat][channel] },
    }));
  };

  const handleSave = async () => {
    setError('');
    try {
      for (const [type, config] of Object.entries(categories)) {
        const data = { notificationType: type, emailEnabled: config.email, inAppEnabled: config.inApp, digestFrequency: frequency };
        if (config.prefId) {
          await updatePref.mutateAsync(data);
        } else {
          await createPref.mutateAsync(data);
        }
      }
    } catch {
      setError('Failed to save preferences.');
    }
  };

  const channels: { key: Channel; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { key: 'inApp', icon: Bell, label: 'In-App' },
    { key: 'email', icon: Mail, label: 'Email' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page font-bold text-text-primary">Notification Preferences</h1>
        <p className="text-caption text-text-tertiary mt-1">Choose how and when you receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <Clock />
            </span>
            <div>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>How often you want to receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <RadioGroup className="flex flex-wrap gap-4 sm:flex-nowrap">
            {(['REALTIME', 'HOURLY', 'DAILY', 'WEEKLY'] as Frequency[]).map((f) => (
              <Radio
                key={f}
                name="frequency"
                value={f}
                checked={frequency === f}
                onChange={() => setFrequency(f)}
                label={f.charAt(0) + f.slice(1).toLowerCase()}
                helperText={
                  f === 'REALTIME' ? 'As they happen' :
                  f === 'HOURLY' ? 'Once every hour' :
                  f === 'DAILY' ? 'Once per day' : 'Weekly digest'
                }
              />
            ))}
          </RadioGroup>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <Bell />
            </span>
            <div>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>Configure notifications for each category and channel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-5 py-3 text-caption font-semibold uppercase tracking-wide text-text-tertiary w-1/3">Category</th>
                  {channels.map((ch) => {
                    const ChIcon = ch.icon;
                    return (
                      <th key={ch.key} className="px-4 py-3 text-center text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                        <span className="hidden sm:inline">{ch.label}</span>
                        <span className="sm:hidden"><ChIcon className="h-4 w-4 mx-auto" /></span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.entries(categories).map(([cat, config], idx) => {
                  const CatIcon = categoryIcons[cat] || Settings;
                  return (
                    <tr key={cat} className={idx % 2 === 0 ? 'bg-surface' : ''}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-3.5 [&>svg]:w-3.5">
                            <CatIcon />
                          </span>
                          <span className="text-body font-medium text-text-primary">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                        </div>
                      </td>
                      {channels.map((ch) => (
                        <td key={ch.key} className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={config[ch.key]}
                              onChange={() => toggleChannel(cat, ch.key)}
                              className="h-4 w-4 cursor-pointer appearance-none rounded border border-border-default bg-canvas transition-colors checked:border-accent-600 checked:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {error && <span className="text-caption font-medium text-danger-600">{error}</span>}
        {(updatePref.isSuccess || createPref.isSuccess) && (
          <span className="text-caption font-medium text-success-700 dark:text-success-500">Saved successfully</span>
        )}
        <Button variant="primary" onClick={handleSave} loading={updatePref.isPending || createPref.isPending}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
