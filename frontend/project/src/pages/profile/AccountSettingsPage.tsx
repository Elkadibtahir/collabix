import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../lib/auth-context';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/user-service';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import type { UpdateProfileRequest } from '../../types';

export function AccountSettingsPage() {
  const { user } = useAuth();
  const wsId = useWorkspaceId();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => {
      if (!wsId) throw new Error('No workspace selected');
      return userService(wsId).updateProfile(data);
    },
  });

  if (!wsId) {
    return (
      <div className="space-y-6">
        <h1 className="text-page font-bold text-text-primary">Account Settings</h1>
        <p className="text-caption text-danger-500">No workspace selected. Please select a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page font-bold text-text-primary">Account Settings</h1>
        <p className="text-caption text-text-tertiary mt-1">Manage your account information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-4 [&>svg]:w-4">
              <User />
            </span>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required helperText="Used for notifications and login" />
            {updateMutation.isError && <p className="text-caption text-danger-500">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to save'}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
              {updateMutation.isSuccess && <span className="text-caption font-medium text-success-700 dark:text-success-500">Saved successfully</span>}
              <Button variant="primary" size="sm" onClick={() => updateMutation.mutate({ firstName, lastName, email })} loading={updateMutation.isPending}>Save Changes</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
