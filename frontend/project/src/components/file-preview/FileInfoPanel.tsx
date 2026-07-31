import { User, Briefcase, Building2, FolderKanban, Tag, Calendar, Clock, Hash } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { type PreviewFile } from './FilePreviewTypes';

interface FileInfoPanelProps {
  file: PreviewFile;
}

export function FileInfoPanel({ file }: FileInfoPanelProps) {
  const details = [
    { icon: User, label: 'Owner', value: file.owner },
    { icon: Briefcase, label: 'Workspace', value: file.workspace },
    { icon: Building2, label: 'Department', value: file.department },
    { icon: FolderKanban, label: 'Project', value: file.project },
    { icon: Calendar, label: 'Uploaded', value: file.uploadDate },
    { icon: Clock, label: 'Last Modified', value: file.uploadDate },
    { icon: Hash, label: 'Version', value: `v${file.version}` },
  ];

  return (
    <div className="space-y-4">
      <p className="text-caption font-semibold text-text-primary">File Information</p>
      <div className="grid grid-cols-2 gap-2">
        {details.filter((d) => d.value).map((d) => (
          <div key={d.label} className="rounded-lg bg-surface p-2.5">
            <div className="flex items-center gap-1.5 text-2xs text-text-tertiary mb-0.5">
              <d.icon className="h-3 w-3" />
              <span>{d.label}</span>
            </div>
            <p className="text-caption font-medium text-text-primary truncate">{d.value}</p>
          </div>
        ))}
      </div>
      {file.tags && file.tags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-caption flex items-center gap-1.5 text-text-tertiary"><Tag className="h-3 w-3" />Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {file.tags.map((t) => (
              <Badge key={t} variant="soft" tone="neutral">{t}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
