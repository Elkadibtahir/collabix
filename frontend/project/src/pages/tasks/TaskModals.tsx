import { useState, type FormEvent } from 'react';
import { AlertTriangle, Plus, Archive, Trash2, RotateCcw } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';

export type TaskModalKind =
  | { kind: 'create' }
  | { kind: 'edit'; task: { id: string; title: string; description?: string } }
  | { kind: 'archive'; task: { id: string; title: string } }
  | { kind: 'restore'; task: { id: string; title: string } }
  | { kind: 'delete'; task: { id: string; title: string } }
  | null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'cx-input h-10';

export function TaskModal({
  state,
  onClose,
  onSubmit,
}: {
  state: TaskModalKind;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
}) {
  if (!state) return null;
  switch (state.kind) {
    case 'create':
      return <CreateModal onClose={onClose} onSubmit={onSubmit} />;
    case 'edit':
      return <EditModal task={state.task} onClose={onClose} onSubmit={onSubmit} />;
    case 'archive':
      return <ArchiveModal task={state.task} onClose={onClose} onConfirm={() => onSubmit({ title: state.task.title })} />;
    case 'restore':
      return <RestoreModal task={state.task} onClose={onClose} onConfirm={() => onSubmit({ title: state.task.title })} />;
    case 'delete':
      return <DeleteModal task={state.task} onClose={onClose} onConfirm={() => onSubmit({ title: state.task.title })} />;
  }
}

function CreateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { title: string; description?: string }) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined });
    onClose();
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="Create Task"
      description="Add a new task to this project."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} leftIcon={<Plus className="h-4 w-4" />} disabled={!title.trim()}>Create Task</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" autoFocus />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." />
        </Field>
      </form>
    </Modal>
  );
}

function EditModal({ task, onClose, onSubmit }: { task: { id: string; title: string; description?: string }; onClose: () => void; onSubmit: (data: { title: string; description?: string }) => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined });
    onClose();
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Task"
      description="Update task details."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Save Changes</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

function ArchiveModal({ task, onClose, onConfirm }: { task: { id: string; title: string }; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} leftIcon={<Archive className="h-4 w-4" />}>Archive Task</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-100 dark:text-warning-500">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h3 className="text-page font-semibold text-text-primary">Archive "{task.title}"?</h3>
        <p className="text-body text-text-secondary max-w-sm">
          The task will be archived and hidden from active views. You can restore it later.
        </p>
      </div>
    </Modal>
  );
}

function RestoreModal({ task, onClose, onConfirm }: { task: { id: string; title: string }; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} leftIcon={<RotateCcw className="h-4 w-4" />}>Restore Task</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-500">
          <RotateCcw className="h-6 w-6" />
        </span>
        <h3 className="text-page font-semibold text-text-primary">Restore "{task.title}"?</h3>
        <p className="text-body text-text-secondary max-w-sm">
          This task will be moved back to the active task list.
        </p>
      </div>
    </Modal>
  );
}

function DeleteModal({ task, onClose, onConfirm }: { task: { id: string; title: string }; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} leftIcon={<Trash2 className="h-4 w-4" />}>Delete Permanently</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600 dark:bg-danger-100 dark:text-danger-500">
          <Trash2 className="h-6 w-6" />
        </span>
        <h3 className="text-page font-semibold text-text-primary">Delete "{task.title}"?</h3>
        <p className="text-body text-text-secondary max-w-sm">
          This action cannot be undone. The task and all its data will be permanently deleted.
        </p>
      </div>
    </Modal>
  );
}
