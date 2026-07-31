import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Hash, Users as UsersIcon, Bell, FileText, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useWorkspaceDefaults } from '../../services/conversation-hooks';
import { useAnnouncementsList } from '../../services/announcement-hooks';
import { useDirectConversations } from '../../services/conversation-hooks';

export function CommunicationDashboard() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const navigate = useNavigate();
  const { data: channels } = useWorkspaceDefaults(wsId);
  const { data: announcements } = useAnnouncementsList(wsId);
  const { data: directMessages } = useDirectConversations(wsId);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-100 dark:text-blue-300">
              <Hash className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-text-primary">{channels?.length ?? 0}</p>
              <p className="text-caption text-text-tertiary">Channels</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-100 dark:text-green-300">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-text-primary">{directMessages?.length ?? 0}</p>
              <p className="text-caption text-text-tertiary">Direct Messages</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-100 dark:text-amber-300">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-text-primary">{announcements?.content?.length ?? 0}</p>
              <p className="text-caption text-text-tertiary">Announcements</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-100 dark:text-purple-300">
              <UsersIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-text-primary">&mdash;</p>
              <p className="text-caption text-text-tertiary">Active Members</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-section font-semibold text-text-primary">Recent Channels</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/communication/conversations')}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            {(!channels || channels.length === 0) ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No channels yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {channels.slice(0, 5).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => navigate(`/app/communication/chat/${ch.id}?ws=${wsId}`)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors text-left"
                  >
                    <Hash className="h-4 w-4 text-text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-text-primary truncate">{ch.name}</p>
                      {ch.lastMessagePreview && (
                        <p className="text-caption text-text-tertiary truncate">{ch.lastMessagePreview}</p>
                      )}
                    </div>
                    {ch.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-600 px-1.5 text-2xs font-semibold text-white">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-section font-semibold text-text-primary">Recent Announcements</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/communication/announcements')}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            {(!announcements?.content || announcements.content.length === 0) ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No announcements yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {announcements.content.slice(0, 5).map((ann) => (
                  <div key={ann.id} className="rounded-lg border border-border-subtle p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.isPinned && <span className="text-2xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-100 px-1.5 py-0.5 rounded">PINNED</span>}
                      <p className="text-body font-medium text-text-primary truncate">{ann.title}</p>
                    </div>
                    <p className="text-caption text-text-tertiary line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
