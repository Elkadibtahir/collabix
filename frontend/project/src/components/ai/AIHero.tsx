import { Sparkles, BookMarked } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

export interface AIHeroProps {
  greeting: string;
  title: string;
  description: string;
  onStartConversation?: () => void;
  onBrowsePrompts?: () => void;
  className?: string;
}

export function AIHero({ greeting, title, description, onStartConversation, onBrowsePrompts, className }: AIHeroProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated', className)}>
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-600/[0.03] blur-3xl dark:bg-accent-400/[0.04]" />
      <div className="relative px-7 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-2 text-caption font-medium text-accent-600 dark:text-accent-400">
          <Sparkles className="h-4 w-4" />
          {greeting}
        </div>
        <h1 className="mt-2 text-display font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-body-lg text-text-secondary">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" leftIcon={<Sparkles />} onClick={onStartConversation}>
            Start a Conversation
          </Button>
          <Button size="lg" variant="outline" leftIcon={<BookMarked />} onClick={onBrowsePrompts}>
            Browse Prompt Library
          </Button>
        </div>
      </div>
    </div>
  );
}
