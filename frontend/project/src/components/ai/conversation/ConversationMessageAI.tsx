import { Sparkles } from 'lucide-react';
import { ConversationResponseActions } from './ConversationResponseActions';
import { ConversationFollowUp } from './ConversationFollowUp';
import { ConversationMessageMarkdown } from './ConversationMessageMarkdown';

interface ConversationMessageAIProps {
  content: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
  bookmarked?: boolean;
  followUps?: string[];
  isLastMessage?: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBookmark: () => void;
  onContinueConversation: () => void;
  onFollowUpSelect: (question: string) => void;
}

export function ConversationMessageAI({
  content,
  timestamp,
  liked,
  disliked,
  bookmarked,
  followUps,
  isLastMessage,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
  onBookmark,
  onContinueConversation,
  onFollowUpSelect,
}: ConversationMessageAIProps) {
  return (
    <div className="flex gap-3 sm:gap-4 group">
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-cx-xs">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-caption font-semibold text-text-primary">Collabix AI</p>
          <span className="text-2xs text-text-tertiary">{timestamp}</span>
        </div>
        <div className="rounded-xl border border-border-subtle bg-elevated dark:bg-surface px-4 py-3 sm:px-5 sm:py-4">
          <ConversationMessageMarkdown content={content} />
        </div>
        <ConversationResponseActions
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          onLike={onLike}
          onDislike={onDislike}
          onBookmark={onBookmark}
          onContinueConversation={onContinueConversation}
          liked={liked}
          disliked={disliked}
          bookmarked={bookmarked}
          isLastMessage={isLastMessage}
        />
        {followUps && followUps.length > 0 && isLastMessage && (
          <ConversationFollowUp
            questions={followUps}
            onSelect={onFollowUpSelect}
          />
        )}
      </div>
    </div>
  );
}
