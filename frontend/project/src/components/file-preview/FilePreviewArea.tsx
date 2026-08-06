import { FileText, Table, Image, Monitor, Headphones, FileArchive, AlertTriangle } from 'lucide-react';
import { type FileType } from './FilePreviewTypes';

interface FilePreviewAreaProps {
  type: FileType;
}

export function FilePreviewArea({ type }: FilePreviewAreaProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-1/50 dark:bg-[#1a1a1a] min-h-[400px] sm:min-h-[500px]">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <PreviewContent type={type} />
      </div>
    </div>
  );
}

function PreviewContent({ type }: { type: FileType }) {
  switch (type) {
    case 'pdf':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-500/10">
            <FileText className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">PDF Document</p>
            <p className="text-caption text-text-tertiary mt-0.5">Document viewer will render PDF content here.</p>
          </div>
        </>
      );
    case 'image':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info-50 text-info-500 dark:bg-info-500/10">
            <Image className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Image Preview</p>
            <p className="text-caption text-text-tertiary mt-0.5">Responsive image viewer placeholder.</p>
          </div>
        </>
      );
    case 'word':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-500 dark:bg-accent-100/10">
            <FileText className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Word Document</p>
            <p className="text-caption text-text-tertiary mt-0.5">Document viewer will render Word content here.</p>
          </div>
        </>
      );
    case 'excel':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-500 dark:bg-success-500/10">
            <Table className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Excel Spreadsheet</p>
            <p className="text-caption text-text-tertiary mt-0.5">Spreadsheet viewer will render tabular data here.</p>
          </div>
        </>
      );
    case 'powerpoint':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50 text-warning-500 dark:bg-warning-500/10">
            <Monitor className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">PowerPoint Presentation</p>
            <p className="text-caption text-text-tertiary mt-0.5">Slide viewer will render presentation content here.</p>
          </div>
        </>
      );
    case 'video':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-500/10">
            <Monitor className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Video Player</p>
            <p className="text-caption text-text-tertiary mt-0.5">Video player placeholder.</p>
          </div>
        </>
      );
    case 'audio':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info-50 text-info-500 dark:bg-info-500/10">
            <Headphones className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Audio Player</p>
            <p className="text-caption text-text-tertiary mt-0.5">Audio player placeholder.</p>
          </div>
        </>
      );
    case 'zip':
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50 text-warning-500 dark:bg-warning-500/10">
            <FileArchive className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">ZIP Archive</p>
            <p className="text-caption text-text-tertiary mt-0.5">Archive contains 12 files — metadata preview only.</p>
          </div>
        </>
      );
    default:
      return (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-text-tertiary">
            <AlertTriangle className="h-8 w-8" />
          </span>
          <div>
            <p className="text-body font-semibold text-text-primary">Unsupported File</p>
            <p className="text-caption text-text-tertiary mt-0.5">This file type cannot be previewed. Please download to view.</p>
          </div>
        </>
      );
  }
}
