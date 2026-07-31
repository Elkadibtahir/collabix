import { Sparkles, MessageSquare, BookMarked, Clock } from 'lucide-react';
import { cn } from '../../lib/cn';
import { AISearchInput } from './AISearchInput';
import { IconButton } from '../ui/IconButton';

export interface AIHeaderProps {
  onNewConversation?: () => void;
  onPromptLibrary?: () => void;
  onHistory?: () => void;
  className?: string;
}

export function AIHeader({ onNewConversation, onPromptLibrary, onHistory, className }: AIHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            <h1 className="text-page font-semibold text-text-primary">Collabix AI</h1>
          </div>
          <p className="mt-0.5 text-caption text-text-tertiary">
            Your intelligent enterprise workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <IconButton label="New Conversation" variant="ghost" size="sm" onClick={onNewConversation}>
            <MessageSquare className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Prompt Library" variant="ghost" size="sm" onClick={onPromptLibrary}>
            <BookMarked className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="History" variant="ghost" size="sm" onClick={onHistory}>
            <Clock className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </div>
      <AISearchInput />
    </div>
  );
}
