import { useState } from 'react';
import { Monitor, Smartphone, Globe, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
  ip: string;
}

const sessions: Session[] = [
  { id: '1', device: 'MacBook Pro 16"', browser: 'Chrome 125', os: 'macOS 14.5', location: 'San Francisco, US', lastActivity: 'Now', isCurrent: true, ip: '192.168.1.42' },
  { id: '2', device: 'iPhone 15 Pro', browser: 'Safari', os: 'iOS 17.5', location: 'San Francisco, US', lastActivity: '2h ago', isCurrent: false, ip: '192.168.1.100' },
  { id: '3', device: 'Windows Desktop', browser: 'Firefox 127', os: 'Windows 11', location: 'New York, US', lastActivity: '1d ago', isCurrent: false, ip: '203.0.113.50' },
  { id: '4', device: 'iPad Air', browser: 'Safari', os: 'iPadOS 17', location: 'Los Angeles, US', lastActivity: '3d ago', isCurrent: false, ip: '198.51.100.20' },
];

export function ActiveSessionsPage() {
  const [terminateId, setTerminateId] = useState<string | null>(null);
  const [terminateAllOpen, setTerminateAllOpen] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [terminated, setTerminated] = useState<string[]>([]);
  const [allTerminated, setAllTerminated] = useState(false);

  const visibleSessions = sessions.filter((s) => !terminated.includes(s.id));

  const handleTerminate = async (id: string) => {
    setTerminating(true);
    await new Promise((r) => setTimeout(r, 800));
    setTerminated((prev) => [...prev, id]);
    setTerminating(false);
    setTerminateId(null);
  };

  const handleTerminateAll = async () => {
    setTerminating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTerminated(sessions.filter((s) => !s.isCurrent).map((s) => s.id));
    setAllTerminated(true);
    setTerminating(false);
    setTerminateAllOpen(false);
    setTimeout(() => setAllTerminated(false), 3000);
  };

  const sessionIcon = (device: string) => {
    if (/iphone|ipad|smartphone|phone/i.test(device)) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page font-bold text-text-primary">Active Sessions</h1>
          <p className="text-caption text-text-tertiary mt-1">Manage your active login sessions across devices</p>
        </div>
        {visibleSessions.filter((s) => !s.isCurrent).length > 0 && (
          <Button variant="danger" size="sm" onClick={() => setTerminateAllOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Terminate All Other Sessions
          </Button>
        )}
      </div>

      {allTerminated && (
        <div className="rounded-lg border border-success-200 dark:border-success-100 bg-success-50 dark:bg-success-100 px-4 py-3">
          <p className="text-body font-medium text-success-700 dark:text-success-500">All other sessions terminated successfully</p>
        </div>
      )}

      <div className="space-y-3">
        {visibleSessions.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                icon={<Monitor className="h-6 w-6" />}
                title="No active sessions"
                description="All other sessions have been terminated. Your current session remains active."
              />
            </CardBody>
          </Card>
        ) : (
          visibleSessions.map((session) => (
            <Card key={session.id} variant={session.isCurrent ? undefined : 'inner'}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary [&>svg]:h-4 [&>svg]:w-4">
                      {sessionIcon(session.device)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body font-medium text-text-primary">{session.device}</p>
                        {session.isCurrent && <Badge tone="success" variant="soft" dot>Current Session</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.browser} on {session.os}
                        </span>
                        <span>{session.location}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.lastActivity}
                        </span>
                      </div>
                      <p className="text-2xs text-text-tertiary mt-0.5">IP: {session.ip}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTerminateId(session.id)}
                      className="shrink-0 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Terminate</span>
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <ConfirmTerminateModal
        open={terminateId !== null}
        onClose={() => setTerminateId(null)}
        onConfirm={() => terminateId && handleTerminate(terminateId)}
        loading={terminating}
        title="Terminate Session"
        description="This will sign the user out of this device. They will need to log in again."
      />

      <ConfirmTerminateModal
        open={terminateAllOpen}
        onClose={() => setTerminateAllOpen(false)}
        onConfirm={handleTerminateAll}
        loading={terminating}
        title="Terminate All Other Sessions"
        description="This will sign out all other devices except your current session. You will remain logged in on this device."
      />
    </div>
  );
}

function ConfirmTerminateModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  description: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Terminate</Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 dark:bg-danger-100 text-danger-500 mb-3 [&>svg]:h-6 [&>svg]:w-6">
          <AlertTriangle />
        </span>
        <h3 className="text-section font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-body text-text-tertiary max-w-xs">{description}</p>
      </div>
    </Modal>
  );
}
