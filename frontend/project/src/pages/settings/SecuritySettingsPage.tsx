import { useState, useMemo } from 'react';
import {
  Lock,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  MoreHorizontal,
  LogOut,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { PasswordStrengthIndicator } from '../auth/PasswordStrengthIndicator';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { cn } from '../../lib/cn';
import { useToast } from '../../components/ui/Toast';

/* ---------- Password requirements ---------- */

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/* ---------- Mock sessions ---------- */

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

const sessionsList: Session[] = [
  { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 130', os: 'macOS 15.0', ip: '192.168.1.100', location: 'San Francisco, CA', lastActivity: 'Active now', isCurrent: true },
  { id: 's2', device: 'iPhone 16 Pro', browser: 'Safari', os: 'iOS 19.0', ip: '192.168.1.101', location: 'San Francisco, CA', lastActivity: '2 hours ago', isCurrent: false },
  { id: 's3', device: 'Windows Desktop', browser: 'Firefox 132', os: 'Windows 11', ip: '203.0.113.45', location: 'New York, NY', lastActivity: 'Yesterday', isCurrent: false },
  { id: 's4', device: 'iPad Air', browser: 'Safari', os: 'iPadOS 19.0', ip: '10.0.0.55', location: 'Los Angeles, CA', lastActivity: '3 days ago', isCurrent: false },
];

/* ---------- Main page ---------- */

export function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState('password');

  const tabItems: TabItem[] = [
    { id: 'password', label: 'Password' },
    { id: 'sessions', label: 'Active Sessions', count: sessionsList.length },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Account Security</h1>
        <p className="text-body text-text-secondary">
          Manage your password and active sessions.
        </p>
      </div>

      <Tabs items={tabItems} onChange={setActiveTab} />

      {activeTab === 'password' && <PasswordSection />}
      {activeTab === 'sessions' && <SessionsSection />}
    </div>
  );
}

/* ---------- Password Section ---------- */

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const reqStates = useMemo(
    () => passwordRequirements.map((r) => ({ ...r, met: r.test(newPassword) })),
    [newPassword],
  );
  const allMet = reqStates.every((r) => r.met);
  const passwordsMatch = confirmPassword === newPassword && confirmPassword.length > 0;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Current password */}
          <div>
            <label className="text-caption font-medium text-text-secondary mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="cx-input pr-10"
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-caption font-medium text-text-secondary mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="cx-input pr-10"
                placeholder="Create a new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {newPassword && <PasswordStrengthIndicator password={newPassword} />}

          {/* Requirements checklist */}
          {newPassword && (
            <div className="space-y-1.5 animate-fade-in">
              {reqStates.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-caption">
                  <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full', r.met ? 'bg-success-500 text-white' : 'bg-surface-2 text-text-tertiary')}>
                    {r.met ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="text-2xs">·</span>}
                  </span>
                  <span className={r.met ? 'text-success-600 dark:text-success-400' : 'text-text-tertiary'}>{r.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm password */}
          <div>
            <label className="text-caption font-medium text-text-secondary mb-1.5 block">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="cx-input pr-10"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1.5 text-caption text-danger-500" role="alert">Passwords do not match.</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="mt-1.5 text-caption text-success-600 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Passwords match
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              leftIcon={<Lock />}
              disabled={!currentPassword || !allMet || !passwordsMatch}
              onClick={handleSave}
            >
              Update Password
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-caption font-medium text-success-600 animate-fade-in">
                <Check className="h-3.5 w-3.5" />
                Password updated
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Two-factor authentication placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-2 p-4">
            <Shield className="h-5 w-5 text-text-tertiary shrink-0 mt-0.5" />
            <div>
              <p className="text-body font-medium text-text-primary">Coming soon</p>
              <p className="text-caption text-text-tertiary mt-0.5">
                Two-factor authentication adds an extra layer of security to your account. This feature will
                be available in a future update.
              </p>
            </div>
            <Badge tone="neutral" variant="soft" className="shrink-0">Planned</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------- Sessions Section ---------- */

function SessionsSection() {
  const { toast } = useToast();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-caption text-text-secondary">
          You are signed in on {sessionsList.length} device{sessionsList.length !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" size="sm" leftIcon={<LogOut />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
          Sign Out All Other Sessions
        </Button>
      </div>

      <Card>
        {sessionsList.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<Monitor className="h-6 w-6" />}
              title="No active sessions"
              description="There are no active sessions for your account."
            />
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Active sessions">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Device</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Browser</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">OS</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Location</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Last Activity</th>
                    <th className="px-4 py-3 text-center text-caption font-semibold text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const { toast } = useToast();
  const actionItems: DropdownItem[] = [
    { label: 'Terminate Session', icon: <LogOut className="h-4 w-4" />, danger: true, disabled: session.isCurrent, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
            {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('ipad') || session.device.toLowerCase().includes('mobile') ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </span>
          <span className="text-body font-medium text-text-primary">{session.device}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-body text-text-secondary">{session.browser}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-body text-text-secondary">{session.os}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          <span className="text-body text-text-secondary">{session.location}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-body text-text-secondary">{session.lastActivity}</span>
      </td>
      <td className="px-4 py-3 text-center">
        {session.isCurrent ? (
          <Badge tone="success" variant="soft" dot>Current session</Badge>
        ) : (
          <Badge tone="neutral" variant="soft">Active</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Dropdown
          trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={actionItems}
          align="right"
        />
      </td>
    </tr>
  );
}
