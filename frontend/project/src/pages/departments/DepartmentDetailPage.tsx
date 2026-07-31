import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Users, Briefcase, GraduationCap, ClipboardCheck, Star, Activity, FileText, TrendingUp, Settings, Info, AlertCircle } from 'lucide-react';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card, CardBody } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDepartmentDetail } from '../../services/department-hooks';

import { HrDashboardTab } from './hr/DashboardTab';
import { CandidatesTab } from './hr/CandidatesTab';
import { EmployeesTab } from './hr/EmployeesTab';
import { SkillsTab } from './hr/SkillsTab';
import { OnboardingTab } from './hr/OnboardingTab';
import { PerformanceReviewsTab } from './hr/PerformanceReviewsTab';

import { DeptOverview } from './common/DeptOverview';
import { DeptManagement } from './common/DeptManagement';
import { DeptDocuments } from './common/DeptDocuments';
import { DeptReports } from './common/DeptReports';
import { DeptAnalytics } from './common/DeptAnalytics';
import { DeptActivity } from './common/DeptActivity';
import { DeptSettings } from './common/DeptSettings';

const standardTabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid /> },
  { id: 'overview', label: 'Overview', icon: <Info /> },
  { id: 'management', label: 'Management', icon: <Users /> },
  { id: 'documents', label: 'Documents', icon: <FileText /> },
  { id: 'reports', label: 'Reports', icon: <FileText /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp /> },
  { id: 'activity', label: 'Activity', icon: <Activity /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
];

const hrTabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid /> },
  { id: 'employees', label: 'Employees', icon: <Users /> },
  { id: 'candidates', label: 'Candidates', icon: <Briefcase /> },
  { id: 'skills', label: 'Skills', icon: <GraduationCap /> },
  { id: 'onboarding', label: 'Onboarding', icon: <ClipboardCheck /> },
  { id: 'reviews', label: 'Reviews', icon: <Star /> },
];

export function DepartmentDetailPage({ departmentId, onBack }: { departmentId: string; onBack: () => void }) {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: dept, isLoading, isError, error } = useDepartmentDetail(wsId || undefined, departmentId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Failed to load department"
            description={error instanceof Error ? error.message : 'An error occurred.'}
          />
        </CardBody>
      </Card>
    );
  }

  const isHR = dept?.name?.toLowerCase().includes('people') || dept?.name?.toLowerCase().includes('hr') || dept?.name?.toLowerCase().includes('culture');
  const tabs = isHR ? hrTabs : standardTabs;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-page font-semibold text-text-primary">{dept?.name ?? 'Department'}</h1>
            <Badge tone={dept?.status === 'ACTIVE' ? 'success' : 'warning'} variant="soft">{dept?.status}</Badge>
          </div>
          <p className="text-caption text-text-tertiary mt-0.5">{dept?.description ?? 'Department overview and management'}</p>
        </div>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {isHR ? (
        <>
          {activeTab === 'dashboard' && <HrDashboardTab wsId={wsId} deptId={departmentId} />}
          {activeTab === 'employees' && <EmployeesTab wsId={wsId} deptId={departmentId} />}
          {activeTab === 'candidates' && <CandidatesTab wsId={wsId} deptId={departmentId} />}
          {activeTab === 'skills' && <SkillsTab wsId={wsId} deptId={departmentId} />}
          {activeTab === 'onboarding' && <OnboardingTab wsId={wsId} deptId={departmentId} />}
          {activeTab === 'reviews' && <PerformanceReviewsTab wsId={wsId} deptId={departmentId} />}
        </>
      ) : (
        <>
          {activeTab === 'dashboard' && <DeptOverview wsId={wsId} deptId={departmentId} />}
          {activeTab === 'overview' && <DeptOverview wsId={wsId} deptId={departmentId} />}
          {activeTab === 'management' && <DeptManagement wsId={wsId} deptId={departmentId} />}
          {activeTab === 'documents' && <DeptDocuments wsId={wsId} deptId={departmentId} />}
          {activeTab === 'reports' && <DeptReports wsId={wsId} deptId={departmentId} />}
          {activeTab === 'analytics' && <DeptAnalytics wsId={wsId} deptId={departmentId} />}
          {activeTab === 'activity' && <DeptActivity wsId={wsId} deptId={departmentId} />}
          {activeTab === 'settings' && <DeptSettings wsId={wsId} deptId={departmentId} />}
        </>
      )}
    </div>
  );
}
