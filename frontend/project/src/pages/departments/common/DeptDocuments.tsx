import { useState } from 'react';
import { Search, FileText, Folder, Upload, Download, MoreHorizontal, Star } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { useToast } from '../../../components/ui/Toast';
import { EmptyState } from '../../../components/ui/EmptyState';

interface DocItem {
  id: string;
  title: string;
  type: string;
  category: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

interface DeptDocumentsData {
  categories: string[];
  documents: DocItem[];
}

export function DeptDocuments({ data, wsId, deptId }: { data?: DeptDocumentsData; wsId?: string; deptId?: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  if (!data) {
    return <EmptyState icon={<FileText />} title="Coming soon" description="Document management will be available in a future update." />;
  }

  const filtered = data.documents.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q)) return false;
    }
    if (category && d.category !== category) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search documents..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
        <Button leftIcon={<Upload />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Upload</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory(null)}
          className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${!category ? 'bg-accent-600 text-white' : 'text-text-secondary hover:bg-surface-2'}`}>
          All
        </button>
        {data.categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${category === c ? 'bg-accent-600 text-white' : 'text-text-secondary hover:bg-surface-2'}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText />} title="No documents found" description="Upload documents to get started." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-body font-medium text-text-primary truncate">{d.title}</p>
                      <p className="text-2xs text-text-tertiary">{d.type}</p>
                    </div>
                  </div>
                  <IconButton label="Favorite" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                    <Star className="h-4 w-4" />
                  </IconButton>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral" variant="soft">{d.category}</Badge>
                  <Badge tone="info" variant="soft">v{d.version}</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                    <Avatar name={d.updatedBy} size="xs" tone={0} />
                    <span>{d.updatedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton label="Download" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><Download className="h-3.5 w-3.5" /></IconButton>
                    <IconButton label="More" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><MoreHorizontal className="h-3.5 w-3.5" /></IconButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
