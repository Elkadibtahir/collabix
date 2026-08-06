import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDirectConversations } from '../../services/conversation-hooks';
import { formatRelativeTime } from '../../lib/format';

export function DirectMessages() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: conversations } = useDirectConversations(wsId);

  const filtered = useMemo(() => {
    if (!conversations) return [];
    if (!search) return conversations;
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [conversations, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search direct messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button variant="primary" onClick={() => navigate(`/app/communication/create-channel?type=DIRECT&ws=${wsId}`)}>
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <Card>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-8 w-8" />}
              title="No direct messages"
              description={search ? 'Try a different search term.' : 'Start a new conversation with a team member.'}
              action={
                <Button variant="primary" onClick={() => navigate(`/app/communication/create-channel?type=DIRECT&ws=${wsId}`)}>
                  <Plus className="h-4 w-4" />
                  New Message
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => navigate(`/app/communication/chat/${conv.id}?ws=${wsId}`)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                >
                  <div className="relative shrink-0">
                    <Avatar
                      name={conv.name}
                      alt={conv.name}
                      size="sm"
                      fallback={conv.name.split(',')[0]?.slice(0, 2) ?? '?'}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-elevated bg-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-text-primary truncate">{conv.name}</p>
                    {conv.lastMessagePreview && (
                      <p className="text-caption text-text-tertiary truncate">{conv.lastMessagePreview}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {conv.lastMessageAt && (
                      <span className="text-2xs text-text-tertiary">{formatRelativeTime(conv.lastMessageAt)}</span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-600 px-1.5 text-2xs font-semibold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
