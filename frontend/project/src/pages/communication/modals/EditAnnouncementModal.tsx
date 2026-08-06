import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useUpdateAnnouncement } from '../../../services/announcement-hooks';
import type { AnnouncementResponse } from '../../../services/announcement-service';

interface EditAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  announcement: AnnouncementResponse | null;
}

export function EditAnnouncementModal({ open, onClose, announcement }: EditAnnouncementModalProps) {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const updateAnnouncement = useUpdateAnnouncement(wsId, announcement?.id ?? '');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setIsPinned(announcement.isPinned);
    }
  }, [announcement, open]);

  const handleSubmit = async () => {
    if (!announcement || !title.trim() || !content.trim()) return;
    try {
      await updateAnnouncement.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
      onClose();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Announcement">
      <div className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="text-caption font-medium text-text-primary mb-1.5 block">Content</label>
          <textarea
            placeholder="Write your announcement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded border-border-subtle"
          />
          <span className="text-body text-text-primary">Pin this announcement</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || updateAnnouncement.isPending}
          >
            {updateAnnouncement.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
