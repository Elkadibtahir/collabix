import { useState } from 'react';
import { Key, Smartphone, Monitor, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import { useChangePasswordMutation } from '../../lib/auth-mutations';

function passwordStrength(password: string): { score: number; label: string; tone: 'danger' | 'warning' | 'accent' | 'success' } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 2) return { score, label: 'Weak', tone: 'danger' };
  if (score <= 4) return { score, label: 'Fair', tone: 'warning' };
  if (score === 5) return { score, label: 'Strong', tone: 'accent' };
  return { score, label: 'Very Strong', tone: 'success' };
}

const securityTips = [
  'Use a unique password for every account',
  'Enable two-factor authentication for added security',
  'Avoid using public Wi-Fi without a VPN',
  'Regularly review your active sessions and devices',
  'Update your password every 90 days',
];

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const changePasswordMutation = useChangePasswordMutation();

  const strength = newPassword ? passwordStrength(newPassword) : null;
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = newPassword && confirmPassword && passwordsMatch && (!currentPassword || newPassword !== currentPassword);

  const handleChangePassword = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page font-bold text-text-primary">Security</h1>
        <p className="text-caption text-text-tertiary mt-1">Manage your password and security settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <Key />
            </span>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              rightIcon={
                <button type="button" onClick={() => setShowCurrent((s) => !s)} aria-label={showCurrent ? 'Hide password' : 'Show password'} className="flex items-center justify-center">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              rightIcon={
                <button type="button" onClick={() => setShowNew((s) => !s)} aria-label={showNew ? 'Hide password' : 'Show password'} className="flex items-center justify-center">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {strength && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-text-tertiary">Password strength</span>
                  <Badge tone={strength.tone}>{strength.label}</Badge>
                </div>
                <Progress value={(strength.score / 6) * 100} tone={strength.tone} size="sm" />
              </div>
            )}
            <Input
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              invalid={!!confirmPassword && !passwordsMatch}
              errorText={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="flex items-center justify-center">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {error && <p className="text-caption text-danger-500">{error}</p>}
            {saved && <p className="text-caption font-medium text-success-700 dark:text-success-500">Password changed successfully</p>}
            <Button variant="primary" onClick={handleChangePassword} loading={saving} disabled={!canSubmit}>
              Update Password
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
                <Smartphone />
              </span>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body text-text-primary font-medium">Authenticator App</p>
                <p className="text-caption text-text-tertiary mt-0.5">Use an authenticator app to generate one-time codes</p>
              </div>
              <Badge tone="neutral" variant="outline">Coming Soon</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
                <Monitor />
              </span>
              <div>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>Manage trusted devices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body text-text-primary font-medium">Device Management</p>
                <p className="text-caption text-text-tertiary mt-0.5">View and manage devices connected to your account</p>
              </div>
              <Badge tone="neutral" variant="outline">Coming Soon</Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card variant="inner">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-100 dark:text-info-500 [&>svg]:h-4 [&>svg]:w-4">
              <Info />
            </span>
            <div>
              <CardTitle>Security Tips</CardTitle>
              <CardDescription>Best practices to keep your account secure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {securityTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-body text-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 dark:bg-accent-100">
                  <span className="text-2xs font-bold text-accent-600 dark:text-accent-300">{i + 1}</span>
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
