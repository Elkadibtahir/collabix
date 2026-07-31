import { cn } from '../../../lib/cn';
import { Avatar } from '../../ui/Avatar';

interface ConversationMessageUserProps {
  content: string;
  timestamp: string;
  edited?: boolean;
  name?: string;
}

export function ConversationMessageUser({ content, timestamp, edited, name = 'You' }: ConversationMessageUserProps) {
  return (
    <div className="flex gap-3 sm:gap-4 flex-row-reverse">
      <Avatar name={name} size="sm" />
      <div className="min-w-0 flex-1 max-w-[80%] sm:max-w-[70%]">
        <div className="flex items-center gap-2 mb-1.5 justify-end">
          <p className="text-caption font-semibold text-text-primary">You</p>
          <span className="text-2xs text-text-tertiary">{timestamp}</span>
          {edited && <span className="text-2xs text-text-tertiary">(edited)</span>}
        </div>
        <div className="rounded-xl bg-accent-600 text-white px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-body leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}
