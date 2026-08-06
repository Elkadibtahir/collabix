import { useState } from 'react';
import {
  Monitor,
  Sun,
  Moon,
  Palette,
  LayoutDashboard,
  Check,
  Save,
  Accessibility,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/cn';
import { useTheme } from '../../lib/theme';

/* ---------- Theme option ---------- */

interface ThemeOption {
  id: 'light' | 'dark' | 'system';
  label: string;
  icon: typeof Sun;
}

const themeOptions: ThemeOption[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

/* ---------- Sidebar option ---------- */

const sidebarOptions = [
  { value: 'expanded', label: 'Always Expanded' },
  { value: 'collapsed', label: 'Always Collapsed' },
  { value: 'auto', label: 'Auto (remember last state)' },
];

/* ---------- Font size options ---------- */

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (Default)' },
  { value: 'large', label: 'Large' },
];

/* ---------- Dashboard options ---------- */

const dashboardOptions = [
  { value: 'overview', label: 'Overview Dashboard' },
  { value: 'tasks', label: 'My Tasks' },
  { value: 'projects', label: 'Projects' },
  { value: 'analytics', label: 'Analytics' },
];

const landingPageOptions = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'projects', label: 'Projects' },
  { value: 'tasks', label: 'Tasks' },
];

/* ---------- Main page ---------- */

export function PersonalPreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Preferences</h1>
          <p className="text-body text-text-secondary">
            Customize your Collabix experience.
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

      <div className="space-y-4">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div>
              <p className="text-caption font-medium text-text-secondary mb-3">Theme</p>
              <div className="flex flex-wrap gap-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-4 py-3 text-body font-medium transition-all min-w-[120px]',
                        isActive
                          ? 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-800 dark:bg-accent-100 dark:text-accent-200'
                          : 'border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{opt.label}</span>
                      {isActive && <Check className="h-4 w-4 text-accent-600 dark:text-accent-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Sidebar Behavior"
                defaultValue="expanded"
                options={sidebarOptions}
              />
              <Select
                label="Default View Mode"
                defaultValue="comfortable"
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Interface Language"
                defaultValue="en"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'ja', label: 'Japanese' },
                ]}
              />
              <Select
                label="Timezone"
                defaultValue="pst"
                options={[
                  { value: 'pst', label: 'PST (Pacific Standard Time)' },
                  { value: 'est', label: 'EST (Eastern Standard Time)' },
                  { value: 'utc', label: 'UTC' },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Toggle
              label="High Contrast Mode"
              description="Increases contrast for better readability."
            />
            <Toggle
              label="Reduced Motion"
              description="Minimizes animations and transitions."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Font Size"
                defaultValue="medium"
                options={fontSizeOptions}
              />
            </div>
          </CardBody>
        </Card>

        {/* Dashboard Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard Preferences
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Default Dashboard"
                defaultValue="overview"
                options={dashboardOptions}
              />
              <Select
                label="Default Landing Page"
                defaultValue="dashboard"
                options={landingPageOptions}
              />
            </div>
            <Toggle
              label="Show Favorite Widgets"
              description="Display your favorite widgets at the top of the dashboard."
              defaultChecked
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
