import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Hash, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useConversationsList } from '../../services/conversation-hooks';
import { useSearchMessages } from '../../services/message-hooks';
import { Avatar } from '../../components/ui/Avatar';
import { formatRelativeTime } from '../../lib/format';

export function MessageSearch() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>();

  const { data: conversations } = useConversationsList(wsId);
  const { data: results, isLoading } = useSearchMessages(wsId, selectedConvId ?? '', query);

  const handleSearch = () => {
    if (!query.trim()) return;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 max-w-lg">
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        {conversations && conversations.content.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedConvId(undefined)}
              className={`rounded-full px-3 py-1 text-2xs font-medium transition-colors ${
                !selectedConvId ? 'bg-accent-600 text-white' : 'bg-surface-2 text-text-tertiary hover:text-text-primary'
              }`}
            >
              All Channels
            </button>
            {conversations.content.slice(0, 8).map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedConvId(conv.id)}
                className={`rounded-full px-3 py-1 text-2xs font-medium transition-colors ${
                  selectedConvId === conv.id ? 'bg-accent-600 text-white' : 'bg-surface-2 text-text-tertiary hover:text-text-primary'
                }`}
              >
                {conv.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
            </div>
          ) : !query ? (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="Search messages"
              description="Enter a search term and filter by channel to find messages."
            />
          ) : !results?.content || results.content.length === 0 ? (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No results"
              description={`No messages found for "${query}".`}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {results.content.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => navigate(`/app/communication/chat/${msg.conversationId}?ws=${wsId}`)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                >
                  <Avatar
                    src={msg.senderProfilePicture}
                    alt={`${msg.senderFirstName} ${msg.senderLastName}`}
                    size="sm"
                    fallback={`${msg.senderFirstName[0]}${msg.senderLastName[0]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-semibold text-text-primary">
                        {msg.senderFirstName} {msg.senderLastName}
                      </span>
                      <span className="text-2xs text-text-tertiary">{formatRelativeTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-caption text-text-tertiary mt-0.5 line-clamp-2">{msg.content}</p>
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
