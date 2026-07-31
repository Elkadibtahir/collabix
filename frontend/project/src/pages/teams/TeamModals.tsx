import { useState, type FormEvent } from 'react';
import { AlertTriangle, Users, Shield, ArrowRightLeft, Archive } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../lib/cn';
import type { ModalState } from './types';
import { useTeamsData } from './data';

export function TeamModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  if (!state) return null;
  switch (state.kind) {
    case 'create':
      return <CreateModal onClose={onClose} />;
    case 'edit':
      return <EditModal onClose={onClose} />;
    case 'archive':
      return <ArchiveModal team={state.team} onClose={onClose} />;
    case 'assign':
      return <AssignModal onClose={onClose} />;
    case 'change-manager':
      return <ChangeManagerModal onClose={onClose} />;
    case 'move':
      return <MoveModal onClose={onClose} />;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'cx-input h-10';

function CreateModal({ onClose }: { onClose: () => void }) {
  const { departments, managers } = useTeamsData();
  const [name, setName] = useState('');
  const [dept, setDept] = useState(departments[0] ?? '');
  const [manager, setManager] = useState(managers[0] ?? '');
  const [desc, setDesc] = useState('');
  return (
    <Modal
      open
      onClose={onClose}
      title="Create Team"
      description="Create a new operational team within a department."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} disabled={!name.trim()}>Create Team</Button>
        </>
      }
    >
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); onClose(); }} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Team Name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Backend Team" autoFocus />
          </Field>
          <Field label="Department">
            <select className={inputCls} value={dept} onChange={(e) => setDept(e.target.value)}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Team Manager">
          <select className={inputCls} value={manager} onChange={(e) => setManager(e.target.value)}>
            {managers.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea className="cx-input min-h-[80px] resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description of the team's purpose..." />
        </Field>
      </form>
    </Modal>
  );
}

function EditModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Team"
      description="Update team information."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Changes</Button>
        </>
      }
    >
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); onClose(); }} className="flex flex-col gap-4">
        <Field label="Team Name">
          <input className={inputCls} defaultValue="Backend Team" autoFocus />
        </Field>
        <Field label="Description">
          <textarea className="cx-input min-h-[80px] resize-none" defaultValue="Server-side engineering, APIs, data pipelines and core platform services." />
        </Field>
      </form>
    </Modal>
  );
}

function ArchiveModal({ team, onClose }: { team: { name: string }; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onClose} leftIcon={<Archive className="h-4 w-4" />}>Archive Team</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-100 dark:text-warning-500">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h3 className="text-page font-semibold text-text-primary">Archive "{team.name}"?</h3>
        <p className="text-body text-text-secondary max-w-sm">
          The team will be moved to archived status. Members remain assigned, but the team will no longer appear in active lists. You can unarchive it later.
        </p>
      </div>
    </Modal>
  );
}

function AssignModal({ onClose }: { onClose: () => void }) {
  const { managers } = useTeamsData();
  const [selected, setSelected] = useState<string[]>([]);
  const candidates = managers;
  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));

  return (
    <Modal
      open
      onClose={onClose}
      title="Assign Members"
      description="Select members to add to this team."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} leftIcon={<Users className="h-4 w-4" />} disabled={selected.length === 0}>
            Assign {selected.length > 0 && `(${selected.length})`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto -mx-1 px-1">
        {candidates.map((name, i) => {
          const checked = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                checked ? 'border-accent-300 bg-accent-50 dark:border-accent-100/50 dark:bg-accent-100/10' : 'border-border-subtle hover:bg-surface-2',
              )}
            >
              <Avatar name={name} size="sm" tone={i} />
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium text-text-primary truncate">{name}</p>
                <p className="text-2xs text-text-tertiary">Available for assignment</p>
              </div>
              <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
                checked ? 'bg-accent-600 border-accent-600 text-white' : 'border-border-default',
              )}>
                {checked && '✓'}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function ChangeManagerModal({ onClose }: { onClose: () => void }) {
  const { managers } = useTeamsData();
  const [manager, setManager] = useState(managers[0] ?? '');
  return (
    <Modal
      open
      onClose={onClose}
      title="Change Team Manager"
      description="Assign a new manager to this team."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} leftIcon={<Shield className="h-4 w-4" />}>Assign Manager</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-caption text-text-tertiary">Select a new manager from the list below.</p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto -mx-1 px-1">
          {managers.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setManager(name)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                manager === name ? 'border-accent-300 bg-accent-50 dark:border-accent-100/50 dark:bg-accent-100/10' : 'border-border-subtle hover:bg-surface-2',
              )}
            >
              <Avatar name={name} size="sm" tone={i} />
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium text-text-primary truncate">{name}</p>
                <p className="text-2xs text-text-tertiary">{i === 0 ? 'Current manager' : 'Available manager'}</p>
              </div>
              {manager === name && <span className="text-caption font-medium text-accent-600">Selected</span>}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function MoveModal({ onClose }: { onClose: () => void }) {
  const { departments } = useTeamsData();
  const [dept, setDept] = useState(departments[0] ?? '');
  return (
    <Modal
      open
      onClose={onClose}
      title="Move Team to Another Department"
      description="Transfer this team to a different department."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} leftIcon={<ArrowRightLeft className="h-4 w-4" />}>Move Team</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-caption text-text-tertiary">Select the destination department.</p>
        <select className={inputCls} value={dept} onChange={(e) => setDept(e.target.value)}>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <p className="text-2xs text-text-tertiary">
          All team members and projects will remain associated with the team after the move.
        </p>
      </div>
    </Modal>
  );
}
