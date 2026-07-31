import { useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { FilePreviewToolbar } from './FilePreviewToolbar';
import { FilePreviewArea } from './FilePreviewArea';
import { FileInfoPanel } from './FileInfoPanel';
import { fileTypeConfig, type PreviewFile } from './FilePreviewTypes';

interface FilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  file?: PreviewFile;
}

export function FilePreviewDialog({ open, onClose, file }: FilePreviewDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !file) return null;

  const cfg = fileTypeConfig[file.type];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-6 lg:inset-8 z-50 flex flex-col rounded-2xl border border-border-subtle bg-elevated shadow-cx-2xl animate-scale-in overflow-hidden max-w-[90vw] max-h-[90vh] mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border-subtle bg-elevated">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.color)}>
              <FileText className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-body font-semibold text-text-primary truncate">{file.name}.{file.extension}</p>
              <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                <Badge variant="soft" tone="neutral">{cfg.label}</Badge>
                <span>{file.size}</span>
                <span>v{file.version}</span>
              </div>
            </div>
          </div>
          <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-[18px] w-[18px]" />
          </IconButton>
        </div>

        <FilePreviewToolbar file={file} />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <FilePreviewArea type={file.type} />
          </div>
          <div className="hidden lg:block w-64 shrink-0 border-l border-border-subtle overflow-y-auto p-4">
            <FileInfoPanel file={file} />
          </div>
        </div>
      </div>
    </>
  );
}
