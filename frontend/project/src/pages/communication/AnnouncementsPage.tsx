import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Plus, Pin, Search, MoreHorizontal } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { Dropdown } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAnnouncementsList } from '../../services/announcement-hooks';
import { formatRelativeTime } from '../../lib/format';

const tabs: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'department', label: 'Department' },
  { id: 'team', label: 'Team' },
];

export function AnnouncementsPage() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading } = useAnnouncementsList(wsId);

  const announcements = useMemo(() => {
    if (!data?.content) return [];
    let items = data.content;
    if (search) {
      items = items.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return items;
  }, [data, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {announcements.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Bell className="h-8 w-8" />}
              title="No announcements"
              description={search ? 'Try a different search term.' : 'Create the first announcement to share with your team.'}
              action={
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((ann) => (
            <Card key={ann.id}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <h3 className="text-body font-semibold text-text-primary">{ann.title}</h3>
                    </div>
                    <p className="text-caption text-text-tertiary mb-3 whitespace-pre-wrap">{ann.content}</p>
                    <div className="flex items-center gap-3 text-2xs text-text-tertiary">
                      <span>{formatRelativeTime(ann.createdAt)}</span>
                      {ann.departmentId && <Badge variant="ghost" size="sm">Department</Badge>}
                      {ann.teamId && <Badge variant="ghost" size="sm">Team</Badge>}
                    </div>
                  </div>
                  <Dropdown
                    trigger={<Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>}
                    items={[
                      { id: 'edit', label: 'Edit' },
                      { id: 'delete', label: 'Delete', className: 'text-danger-600' },
                    ]}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
