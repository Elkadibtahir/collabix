import { useRef, useEffect } from 'react';
import { cn } from '../../../lib/cn';
import { type Message } from './ConversationTypes';
import { ConversationMessageAI } from './ConversationMessageAI';
import { ConversationMessageUser } from './ConversationMessageUser';
import { ConversationMessageSystem } from './ConversationMessageSystem';

interface ConversationMessagesProps {
  messages: Message[];
  onCopy: (id: string, content: string) => void;
  onRegenerate: (id: string) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onBookmark: (id: string) => void;
  onContinueConversation: (id: string) => void;
  onFollowUpSelect: (id: string, question: string) => void;
}

export function ConversationMessages({
  messages,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
  onBookmark,
  onContinueConversation,
  onFollowUpSelect,
}: ConversationMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {messages.map((msg, idx) => {
        const isLast = idx === messages.length - 1;

        switch (msg.role) {
          case 'user':
            return (
              <ConversationMessageUser
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                edited={msg.edited}
                name="You"
              />
            );
          case 'ai':
            return (
              <ConversationMessageAI
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                liked={msg.liked}
                disliked={msg.disliked}
                bookmarked={msg.bookmarked}
                followUps={msg.followUps}
                isLastMessage={isLast}
                onCopy={() => onCopy(msg.id, msg.content)}
                onRegenerate={() => onRegenerate(msg.id)}
                onLike={() => onLike(msg.id)}
                onDislike={() => onDislike(msg.id)}
                onBookmark={() => onBookmark(msg.id)}
                onContinueConversation={() => onContinueConversation(msg.id)}
                onFollowUpSelect={(q) => onFollowUpSelect(msg.id, q)}
              />
            );
          case 'system':
            return (
              <ConversationMessageSystem
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                variant={msg.variant}
              />
            );
          default:
            return null;
        }
      })}
      <div ref={bottomRef} />
    </div>
  );
}
