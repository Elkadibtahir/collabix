import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { useRestoreProject } from '../../../services/project-hooks';

interface RestoreProjectModalProps {
  open: boolean;
  onClose: () => void;
  wsId: string;
  deptId: string;
  projectId: string;
  projectName: string;
}

export function RestoreProjectModal({ open, onClose, wsId, deptId, projectId, projectName }: RestoreProjectModalProps) {
  const { toast } = useToast();
  const restoreMutation = useRestoreProject();

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync({ wsId, deptId, projectId });
      toast({ title: 'Success', description: `Project "${projectName}" restored.` });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to restore project.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Restore Project"
      description={`Restore "${projectName}" to active projects?`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRestore} disabled={restoreMutation.isPending}>
            {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
          </Button>
        </div>
      }
    >
      <p className="text-body text-text-secondary">The project will be moved back to active projects with its original status.</p>
    </Modal>
  );
}
