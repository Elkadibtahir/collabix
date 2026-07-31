export type FileType = 'pdf' | 'image' | 'word' | 'excel' | 'powerpoint' | 'text' | 'markdown' | 'video' | 'audio' | 'zip' | 'unknown';

export interface PreviewFile {
  id: string;
  name: string;
  extension: string;
  type: FileType;
  size: string;
  uploadDate: string;
  owner: string;
  version: number;
  workspace?: string;
  department?: string;
  project?: string;
  tags?: string[];
  url?: string;
}

export interface RelatedFile {
  id: string;
  name: string;
  type: FileType;
  extension: string;
}

export const fileTypeConfig: Record<FileType, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-300' },
  image: { label: 'Image', color: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-300' },
  word: { label: 'Word', color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300' },
  excel: { label: 'Excel', color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-300' },
  powerpoint: { label: 'PowerPoint', color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-300' },
  text: { label: 'Text', color: 'bg-surface-2 text-text-secondary dark:bg-surface-2' },
  markdown: { label: 'Markdown', color: 'bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300' },
  video: { label: 'Video', color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-300' },
  audio: { label: 'Audio', color: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-300' },
  zip: { label: 'ZIP', color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-300' },
  unknown: { label: 'File', color: 'bg-surface-2 text-text-secondary' },
};

export const mockPreviewFile: PreviewFile | null = null;

export const mockRelatedFiles: RelatedFile[] = [];
