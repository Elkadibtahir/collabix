import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Send, Paperclip, Pin, MoreHorizontal, UserPlus, Hash, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../lib/cn';
import { useConversationDetail, useConversationMembers } from '../../services/conversation-hooks';
import { useMessages, useCreateMessage, usePinnedMessages } from '../../services/message-hooks';
import { formatRelativeTime } from '../../lib/format';
import type { MessageResponse } from '../../types/communication';

export function ChatWindow() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversation, isLoading: convLoading } = useConversationDetail(wsId, conversationId);
  const { data: members } = useConversationMembers(wsId, conversationId ?? '');
  const { data: pinnedData } = usePinnedMessages(wsId, conversationId ?? '');
  const { data: messagesPages, isLoading: msgsLoading, fetchNextPage, hasNextPage } = useMessages(wsId, conversationId ?? '');
  const createMessage = useCreateMessage(wsId, conversationId ?? '');

  const messages = useMemo(() => {
    if (!messagesPages?.pages) return [];
    return messagesPages.pages.flatMap((p) => p.content);
  }, [messagesPages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;
    try {
      await createMessage.mutateAsync({ content: newMessage.trim() });
      setNewMessage('');
      inputRef.current?.focus();
    } catch {
      // handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (convLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <EmptyState
        icon={<Hash className="h-8 w-8" />}
        title="Select a conversation"
        description="Choose a channel or direct message from the list."
      />
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-elevated">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
            {conversation.isPrivate ? <UserPlus className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-body font-semibold text-text-primary">{conversation.name}</p>
            <p className="text-caption text-text-tertiary">{conversation.memberCount} members</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {pinnedData && pinnedData.length > 0 && (
            <IconButton icon={<Pin className="h-4 w-4" />} ariaLabel={`${pinnedData.length} pinned messages`} />
          )}
          <IconButton icon={<MoreHorizontal className="h-4 w-4" />} ariaLabel="More options" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {hasNextPage && (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
              Load older messages
            </Button>
          </div>
        )}

        {msgsLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-caption text-text-tertiary">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <IconButton icon={<Paperclip className="h-4 w-4" />} ariaLabel="Attach file" />
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder={`Message #${conversation.name}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!newMessage.trim() || createMessage.isPending}
          >
            {createMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: MessageResponse }) {
  const isDeleted = message.status === 'DELETED';

  return (
    <div className={cn('flex items-start gap-3 group', isDeleted && 'opacity-50')}>
      <Avatar
        src={message.senderProfilePicture}
        alt={`${message.senderFirstName} ${message.senderLastName}`}
        size="sm"
        fallback={`${message.senderFirstName[0]}${message.senderLastName[0]}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-body font-semibold text-text-primary">
            {message.senderFirstName} {message.senderLastName}
          </span>
          <span className="text-2xs text-text-tertiary">
            {formatRelativeTime(message.createdAt)}
          </span>
          {message.status === 'EDITED' && (
            <span className="text-2xs text-text-tertiary">(edited)</span>
          )}
          {message.isPinned && (
            <Pin className="h-3 w-3 text-amber-500" />
          )}
        </div>
        <p className={cn(
          'text-body text-text-primary mt-0.5',
          isDeleted && 'italic text-text-tertiary',
        )}>
          {message.content}
        </p>
        {message.fileUrl && (
          <div className="mt-2 rounded-lg border border-border-subtle bg-surface-2 p-3">
            <p className="text-caption font-medium text-text-primary">{message.fileName}</p>
            {message.mimeType?.startsWith('image/') && (
              <img src={message.fileUrl} alt={message.fileName ?? ''} className="mt-2 max-h-48 rounded object-contain" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
