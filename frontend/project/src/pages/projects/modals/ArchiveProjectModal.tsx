import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { useDeleteProject } from '../../../services/project-hooks';

interface ArchiveProjectModalProps {
  open: boolean;
  onClose: () => void;
  wsId: string;
  deptId: string;
  projectId: string;
  projectName: string;
}

export function ArchiveProjectModal({ open, onClose, wsId, deptId, projectId, projectName }: ArchiveProjectModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const deleteMutation = useDeleteProject();

  const handleArchive = async () => {
    try {
      await deleteMutation.mutateAsync({ wsId, deptId, projectId });
      toast({ title: 'Success', description: `Project "${projectName}" archived.` });
      onClose();
      navigate('/app/projects');
    } catch {
      toast({ title: 'Error', description: 'Failed to archive project.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Archive Project"
      description={`Are you sure you want to archive "${projectName}"? It will be moved to archived projects.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleArchive} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      }
    >
      <p className="text-body text-text-secondary">Archived projects can be restored later from the archived projects view.</p>
    </Modal>
  );
}
