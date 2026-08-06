import { useState } from 'react';
import { X, Building2, FolderKanban, Users, Clock, MessageSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ConversationContextPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ConversationContextPanel({ open, onClose }: ConversationContextPanelProps) {
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    workspace: true,
    documents: true,
    metadata: true,
    actions: true,
  });

  function toggleSection(key: string) {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!open) return null;

  return (
    <div className="hidden lg:block w-80 shrink-0 border border-border-subtle rounded-xl bg-surface overflow-y-auto h-[calc(100vh-7rem)] sticky top-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
        <p className="text-section font-semibold text-text-primary">Context</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close context panel"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <Section
          title="Current Context"
          open={sectionsOpen.workspace}
          onToggle={() => toggleSection('workspace')}
        >
          <div className="space-y-2.5">
            <ContextRow icon={<Building2 />} label="Workspace" value="—" />
            <ContextRow icon={<FolderKanban />} label="Project" value="—" />
            <ContextRow icon={<Users />} label="Department" value="—" />
          </div>
        </Section>

        <Section
          title="Attached Documents"
          open={sectionsOpen.documents}
          onToggle={() => toggleSection('documents')}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-caption text-text-tertiary">
              No documents attached to the current conversation.
            </div>
          </div>
        </Section>

        <Section
          title="Conversation Details"
          open={sectionsOpen.metadata}
          onToggle={() => toggleSection('metadata')}
        >
          <div className="space-y-2">
            <ContextRow icon={<Clock />} label="Created" value="—" />
            <ContextRow icon={<Clock />} label="Last activity" value="—" />
            <ContextRow icon={<MessageSquare />} label="Messages" value="—" />
          </div>
        </Section>

        <Section
          title="Recent AI Actions"
          open={sectionsOpen.actions}
          onToggle={() => toggleSection('actions')}
        >
          <div className="space-y-1.5">
            <div className="flex items-start gap-2 rounded-lg px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-accent-500 mt-0.5 shrink-0" />
              <p className="text-caption text-text-tertiary">No recent AI actions.</p>
            </div>
          </div>
        </Section>

        <div className="rounded-lg bg-surface-2 p-3">
          <p className="text-2xs font-medium text-text-tertiary mb-1">Sources</p>
          <p className="text-caption text-text-tertiary">
            Source references and citations will appear here when available.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2.5 bg-surface-2 hover:bg-surface transition-colors"
      >
        <p className="text-caption font-medium text-text-secondary">{title}</p>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-text-tertiary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

function ContextRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-text-tertiary [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-text-tertiary">{label}</p>
        <p className="text-caption font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
