import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Edit,
  Save,
  Check,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { useAuth } from '../../lib/auth-context';

export function MyProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const displayEmail = user?.email ?? '—';

  const tabItems: TabItem[] = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment' },
    { id: 'workspace', label: 'Workspace' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative shrink-0">
          <Avatar name={displayName} size="lg" tone={0} ring />
          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border-default bg-elevated text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors shadow-cx-sm"
            aria-label="Change profile picture"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-page font-semibold text-text-primary">{displayName}</h1>
              <p className="text-body text-text-secondary">—</p>
            </div>
            <Button leftIcon={<Save />}>Save Changes</Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge tone="success" variant="soft">Active</Badge>
            <Badge tone="info" variant="soft">—</Badge>
            <Badge tone="accent" variant="soft">—</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Mail />} label="Email" value={displayEmail} />
        <InfoCard icon={<Phone />} label="Phone" value="—" />
        <InfoCard icon={<MapPin />} label="Location" value="—" />
        <InfoCard icon={<CalendarDays />} label="Started" value="—" />
      </div>

      <Tabs items={tabItems} onChange={setActiveTab} />

      {activeTab === 'personal' && <PersonalSection />}
      {activeTab === 'employment' && <EmploymentSection />}
      {activeTab === 'workspace' && <WorkspaceSection />}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="text-accent-600 dark:text-accent-400 [&>svg]:h-5 [&>svg]:w-5 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-2xs text-text-tertiary">{label}</p>
          <p className="text-body font-medium text-text-primary truncate">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function PersonalSection() {
  return (
    <div className="space-y-4">
      <ProfileCard title="Personal Information" description="Update your personal details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" defaultValue="" />
          <Input label="Last Name" defaultValue="" />
          <Input label="Email" defaultValue="" type="email" />
          <Input label="Phone" defaultValue="" type="tel" />
          <Input label="Job Title" defaultValue="" />
          <Input label="Location" defaultValue="" />
        </div>
        <Textarea label="Biography" defaultValue="" rows={3} />
      </ProfileCard>
    </div>
  );
}

function EmploymentSection() {
  return (
    <div className="space-y-4">
      <ProfileCard title="Employment Information" description="Your role and team details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Department" defaultValue="" />
          <Input label="Team" defaultValue="" />
          <Input label="Role" defaultValue="" />
          <Select
            label="Employment Type"
            defaultValue=""
            options={[
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'intern', label: 'Intern' },
            ]}
          />
          <Input label="Manager" defaultValue="" />
          <Input label="Start Date" defaultValue="" />
        </div>
      </ProfileCard>
    </div>
  );
}

function WorkspaceSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <ProfileCard title="Workspace Information" description="Your workspace membership details.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Workspace" defaultValue="" disabled />
            <Input label="Department" defaultValue="" disabled />
            <Input label="Team" defaultValue="" disabled />
            <Input label="Member Since" defaultValue="" disabled />
          </div>
        </ProfileCard>

        <ProfileCard title="Assigned Projects" description="Projects you are currently contributing to.">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-caption text-text-tertiary">No projects assigned yet</p>
          </div>
        </ProfileCard>

        <ProfileCard title="Recent Activity" description="Your latest actions in the workspace.">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-caption text-text-tertiary">No recent activity</p>
          </div>
        </ProfileCard>
      </div>

      <div className="space-y-4">
        <ProfileCard title="Quick Stats" description="">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-caption text-text-tertiary">Not yet available</p>
          </div>
        </ProfileCard>

        <ProfileCard title="Recent Notifications" description="">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-caption text-text-tertiary">No recent notifications</p>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}

function ProfileCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-caption text-text-secondary mt-1">{description}</p>}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
