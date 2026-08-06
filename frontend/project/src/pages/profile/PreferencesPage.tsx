import { useState } from 'react';
import { Moon, Sun, Monitor, LayoutDashboard, Eye } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';

export function PreferencesPage() {
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [landingPage, setLandingPage] = useState('dashboard');
  const [defaultDashboard, setDefaultDashboard] = useState('overview');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page font-bold text-text-primary">Preferences</h1>
        <p className="text-caption text-text-tertiary mt-1">Customize your Collabix experience</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <Monitor />
            </span>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of Collabix</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <div>
            <p className="text-body font-medium text-text-primary mb-3">Theme</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                      theme === opt.value
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-100/15'
                        : 'border-border-subtle hover:border-border-default bg-surface'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${theme === opt.value ? 'text-accent-600 dark:text-accent-400' : 'text-text-tertiary'}`} />
                    <span className={`text-caption font-medium ${theme === opt.value ? 'text-accent-700 dark:text-accent-200' : 'text-text-secondary'}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'es', label: 'Spanish' },
              { value: 'ja', label: 'Japanese' },
            ]} />
            <Select label="Date Format" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]} />
            <Select label="Time Format" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} options={[
              { value: '12h', label: '12-hour (1:00 PM)' },
              { value: '24h', label: '24-hour (13:00)' },
            ]} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <LayoutDashboard />
            </span>
            <div>
              <CardTitle>Dashboard & Sidebar</CardTitle>
              <CardDescription>Configure your workspace layout preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <Toggle label="Compact Sidebar" description="Reduce sidebar width to show more content" checked={sidebarCompact} onChange={(e) => setSidebarCompact(e.target.checked)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Landing Page" value={landingPage} onChange={(e) => setLandingPage(e.target.value)} options={[
              { value: 'dashboard', label: 'Dashboard' },
              { value: 'projects', label: 'Projects' },
              { value: 'tasks', label: 'Tasks' },
              { value: 'workspace', label: 'Workspace Overview' },
            ]} />
            <Select label="Default Dashboard" value={defaultDashboard} onChange={(e) => setDefaultDashboard(e.target.value)} options={[
              { value: 'overview', label: 'Overview' },
              { value: 'analytics', label: 'Analytics' },
              { value: 'activity', label: 'Activity' },
            ]} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <Eye />
            </span>
            <div>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Make Collabix work better for you</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <Toggle label="High Contrast" description="Increase contrast for better readability" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
          <Toggle label="Reduced Motion" description="Minimize animations and transitions" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
          <Select label="Font Size" value={fontSize} onChange={(e) => setFontSize(e.target.value)} options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]} />
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-caption font-medium text-success-700 dark:text-success-500">Preferences saved successfully</span>}
        <Button variant="primary" onClick={handleSave} loading={saving}>Save Preferences</Button>
      </div>
    </div>
  );
}
