import { useState } from 'react';
import { Search, FileText, Download, Star, MoreHorizontal, BarChart3 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { useToast } from '../../../components/ui/Toast';
import { EmptyState } from '../../../components/ui/EmptyState';

interface ReportItem {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  favorite: boolean;
}

interface DeptReportsData {
  categories: string[];
  reports: ReportItem[];
}

export function DeptReports({ data, wsId, deptId }: { data?: DeptReportsData; wsId?: string; deptId?: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  if (!data) {
    return <EmptyState icon={<BarChart3 />} title="Coming soon" description="Reports will be available in a future update." />;
  }

  const filtered = data.reports.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q)) return false;
    }
    if (category && r.category !== category) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search reports..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
        <Button leftIcon={<BarChart3 />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Generate Report</Button>
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
        <EmptyState icon={<FileText />} title="No reports found" description="Generate reports to track performance." />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">{r.title}</p>
                <p className="text-2xs text-text-tertiary">{r.author} • {r.date}</p>
              </div>
              <Badge tone="neutral" variant="soft">{r.category}</Badge>
              <IconButton label="Favorite" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                <Star className={`h-4 w-4 ${r.favorite ? 'text-warning-500 fill-warning-500' : ''}`} />
              </IconButton>
              <IconButton label="Download" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><Download className="h-4 w-4" /></IconButton>
              <IconButton label="More" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><MoreHorizontal className="h-4 w-4" /></IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
