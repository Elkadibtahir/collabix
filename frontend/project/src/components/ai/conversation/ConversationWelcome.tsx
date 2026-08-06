import { Sparkles, BarChart3, ScrollText, FileText } from 'lucide-react';
import { Button } from '../../ui/Button';

const suggestedPrompts = [
  'Analyze project risks',
  'Generate executive report',
  'Summarize handover notes',
  'Explain this document',
];

interface ConversationWelcomeProps {
  onStartConversation: () => void;
  onPromptClick: (prompt: string) => void;
}

export function ConversationWelcome({ onStartConversation, onPromptClick }: ConversationWelcomeProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12">
      <div className="relative mb-8">
        <div className="pointer-events-none absolute -inset-16 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-cx-lg">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
      </div>

      <h1 className="text-display font-bold text-text-primary text-center tracking-tight">
        Welcome to Collabix AI
      </h1>
      <p className="mt-3 max-w-lg text-body-lg text-text-secondary text-center leading-relaxed">
        Ask questions, generate reports, summarize information and discover insights
        across your workspace.
      </p>

      <div className="mt-8">
        <Button size="lg" leftIcon={<Sparkles />} onClick={onStartConversation}>
          Start a Conversation
        </Button>
      </div>

      <div className="mt-12 w-full max-w-2xl">
        <p className="text-caption font-medium text-text-tertiary text-center mb-4">
          Suggested Prompts
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptClick(prompt)}
              className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-caption text-text-secondary hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:hover:bg-accent-100/10 dark:hover:text-accent-300 dark:hover:border-accent-700 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3 max-w-2xl w-full">
        {[
          { icon: <BarChart3 />, title: 'Analyze Metrics', desc: 'Dashboards and business KPIs' },
          { icon: <ScrollText />, title: 'Handover Summaries', desc: 'Executive transition notes' },
          { icon: <FileText />, title: 'Generate Reports', desc: 'Professional business reports' },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-surface px-4 py-5 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
              {item.icon}
            </span>
            <p className="text-body font-medium text-text-primary">{item.title}</p>
            <p className="text-caption text-text-tertiary">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
