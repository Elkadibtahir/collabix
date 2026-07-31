import { FileText, Download, Copy, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { fileTypeConfig, type PreviewFile, type FileType } from './FilePreviewTypes';

interface FilePreviewToolbarProps {
  file: PreviewFile;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onFullscreen?: () => void;
  onCopyLink?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function FilePreviewToolbar({
  file, onZoomIn, onZoomOut, onRotate, onFullscreen,
  onCopyLink, onDownload, onShare, onPrev, onNext,
  hasPrev, hasNext,
}: FilePreviewToolbarProps) {
  const cfg = fileTypeConfig[file.type];

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-elevated px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.color)}>
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-caption font-medium text-text-primary truncate">{file.name}.{file.extension}</p>
          <div className="flex items-center gap-2 text-2xs text-text-tertiary">
            <Badge variant="soft" tone="neutral" className="text-2xs">{cfg.label.toUpperCase()}</Badge>
            <span>{file.size}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="hidden sm:flex items-center gap-1 mr-2">
          <IconButton label="Previous file" variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton label="Next file" variant="ghost" size="sm" onClick={onNext} disabled={!hasNext}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-border-subtle" />
        </div>
        <IconButton label="Zoom in" variant="ghost" size="sm" onClick={onZoomIn}><SearchPlusIcon /></IconButton>
        <IconButton label="Zoom out" variant="ghost" size="sm" onClick={onZoomOut}><SearchMinusIcon /></IconButton>
        <IconButton label="Rotate" variant="ghost" size="sm" onClick={onRotate}><RotateIcon /></IconButton>
        <IconButton label="Fullscreen" variant="ghost" size="sm" onClick={onFullscreen}><ExternalLink className="h-4 w-4" /></IconButton>
        <span className="mx-1 h-5 w-px bg-border-subtle" />
        <IconButton label="Copy link" variant="ghost" size="sm" onClick={onCopyLink}><Copy className="h-4 w-4" /></IconButton>
        <IconButton label="Download" variant="ghost" size="sm" onClick={onDownload}><Download className="h-4 w-4" /></IconButton>
        <IconButton label="Share" variant="ghost" size="sm" onClick={onShare}><Share2 className="h-4 w-4" /></IconButton>
      </div>
    </div>
  );
}

function SearchPlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function SearchMinusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}
