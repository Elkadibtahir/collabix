import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Send,
  Plus,
  Check,
  X,
  CheckCircle2,
  Archive,
  Clock,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { useToast } from '../../components/ui/Toast';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import {
  useHandoverInbox,
  useHandoverSent,
  useAcceptHandover,
  useRejectHandover,
  useCompleteHandover,
  useSendHandover,
  useDeleteHandoverEntry,
} from '../../services/handover-hooks';
import type { HandoverEntryResponse } from '../../services/handover-service';
import { CreateHandoverModal } from './CreateHandoverModal';

const statusTone: Record<string, 'neutral' | 'info' | 'success' | 'danger' | 'warning'> = {
  DRAFT: 'neutral',
  PENDING: 'info',
  ACCEPTED: 'warning',
  REJECTED: 'danger',
  COMPLETED: 'success',
  ARCHIVED: 'neutral',
};

const priorityTone: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'success',
  HIGH: 'warning',
  URGENT: 'danger',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function isOverdue(entry: HandoverEntryResponse) {
  if (!entry?.dueDate) return false;
  const status = entry.status ?? '';
  return new Date(entry.dueDate).getTime() < Date.now() && status !== 'COMPLETED' && status !== 'ARCHIVED';
}

export function HandoverPage() {
  const wsId = useWorkspaceId();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [showCreate, setShowCreate] = useState(false);

  const inboxQuery = useHandoverInbox(wsId);
  const sentQuery = useHandoverSent(wsId);

  const acceptMutation = useAcceptHandover(wsId);
  const rejectMutation = useRejectHandover(wsId);
  const completeMutation = useCompleteHandover(wsId);
  const sendMutation = useSendHandover(wsId);
  const deleteMutation = useDeleteHandoverEntry(wsId);

  const handleAction = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast({ title: success, tone: 'success' });
    } catch (err) {
      toast({
        title: 'Action failed',
        description: (err as { message?: string })?.message ?? 'An unexpected error occurred.',
        tone: 'danger',
      });
    }
  };

  if (inboxQuery.isLoading || sentQuery.isLoading) return <PageLoader />;

  const inbox = inboxQuery.data?.content ?? [];
  const sent = sentQuery.data?.content ?? [];

  const inboxCount = inbox.filter((e) => e.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Handovers</h1>
          <p className="text-body text-text-secondary">
            Send and track work handovers between team members.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus />}>New Handover</Button>
      </div>

      <Tabs
        items={[
          { id: 'inbox', label: 'Inbox', icon: <Inbox />, count: inboxCount },
          { id: 'sent', label: 'Sent', icon: <Send /> },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'inbox' | 'sent')}
      />

      {tab === 'inbox' ? (
        inbox.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                icon={<Inbox />}
                title="No handovers in your inbox"
                description="When a teammate hands work over to you, it will appear here."
              />
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {inbox.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                actions={
                  entry.status === 'PENDING' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        leftIcon={<Check />}
                        loading={acceptMutation.isPending}
                        onClick={() =>
                          handleAction(() => acceptMutation.mutateAsync({ entryId: entry.id }), 'Handover accepted')
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<X />}
                        loading={rejectMutation.isPending}
                        onClick={() =>
                          handleAction(() => rejectMutation.mutateAsync({ entryId: entry.id }), 'Handover rejected')
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  ) : entry.status === 'ACCEPTED' ? (
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle2 />}
                      loading={completeMutation.isPending}
                      onClick={() =>
                        handleAction(() => completeMutation.mutateAsync({ entryId: entry.id }), 'Handover completed')
                      }
                    >
                      Mark Complete
                    </Button>
                  ) : undefined
                }
                onOpen={() => navigate(`/app/handover/${entry.id}`)}
              />
            ))}
          </div>
        )
      ) : sent.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Send />}
              title="No handovers sent"
              description="Create a handover to share work context with a teammate."
              action={<Button onClick={() => setShowCreate(true)} leftIcon={<Plus />}>New Handover</Button>}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sent.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              actions={
                entry.status === 'DRAFT' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      leftIcon={<Send />}
                      loading={sendMutation.isPending}
                      onClick={() =>
                        handleAction(() => sendMutation.mutateAsync({ entryId: entry.id }), 'Handover sent')
                      }
                    >
                      Send
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Trash2 />}
                      loading={deleteMutation.isPending}
                      onClick={() =>
                        handleAction(() => deleteMutation.mutateAsync(entry.id), 'Handover deleted')
                      }
                    >
                      Delete
                    </Button>
                  </div>
                ) : undefined
              }
              onOpen={() => navigate(`/app/handover/${entry.id}`)}
            />
          ))}
        </div>
      )}

      <CreateHandoverModal open={showCreate} onClose={() => setShowCreate(false)} workspaceId={wsId} />
    </div>
  );
}

function EntryCard({
  entry,
  actions,
  onOpen,
}: {
  entry: HandoverEntryResponse;
  actions?: React.ReactNode;
  onOpen: () => void;
}) {
  const overdue = isOverdue(entry);

  return (
    <Card className="hover:border-border-default transition-colors">
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpen}
                className="text-body font-semibold text-text-primary hover:text-accent-600 hover:underline transition-colors text-left"
              >
                {entry.title}
              </button>
              <Badge tone={statusTone[entry.status]} variant="soft">{entry.status}</Badge>
              <Badge tone={priorityTone[entry.priority]} variant="outline">{entry.priority}</Badge>
              {overdue && <Badge tone="danger" dot>Overdue</Badge>}
            </div>
            <p className="mt-1 line-clamp-2 text-body text-text-secondary">{entry.content}</p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            aria-label="Open handover"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-subtle pt-3 text-caption text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-accent-50 text-accent-700 text-2xs font-semibold inline-flex items-center justify-center">
              {(entry.sender?.firstName?.[0] ?? '?') + (entry.sender?.lastName?.[0] ?? '')}
            </span>
            {entry.sender?.firstName} {entry.sender?.lastName}
            <span className="text-text-tertiary">→</span>
            {(entry.receiver?.firstName ?? '') + ' ' + (entry.receiver?.lastName ?? '')}
          </span>
          {entry.dueDate && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-text-tertiary" />
              Due {formatDate(entry.dueDate)}
            </span>
          )}
          <span className="text-text-tertiary">Created {formatDate(entry.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
          <div className="flex items-center gap-4 text-caption text-text-tertiary">
            <button
              type="button"
              onClick={onOpen}
              className="flex items-center gap-1.5 text-accent-600 hover:underline transition-colors"
            >
              <Archive className="h-3.5 w-3.5" /> View details
            </button>
          </div>
          {actions}
        </div>
      </CardBody>
    </Card>
  );
}
