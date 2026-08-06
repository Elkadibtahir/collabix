import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  LayoutList,
  Table,
  ChevronDown,
  Eye,
  Edit2,
  Archive,
  Trash2,
  Upload,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { useDocumentsList } from '../../../services/document-hooks';
import { getFileIcon, formatDate, formatFileSize } from '../types/document-types';
import type { DocumentResponse } from '../types/document-types';
import { UploadDocumentModal, EditDocumentModal, DeleteDocumentModal, ArchiveDocumentModal } from './DocumentModals';

type ViewMode = 'grid' | 'table' | 'list';

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('ws') ?? '';
  const departmentId = searchParams.get('dept') ?? '';
  const projectId = searchParams.get('proj') ?? '';
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [modal, setModal] = useState<{ type: string; doc?: DocumentResponse } | null>(null);

  const { data: docsData, isLoading, isError } = useDocumentsList(workspaceId, departmentId, projectId);

  const documents = useMemo(() => {
    if (!docsData?.content) return [];
    return docsData.content;
  }, [docsData]);

  const filteredDocuments = useMemo(() => {
    let result = documents;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description ?? '').toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return result;
  }, [documents, search, sortBy]);

  const stats = {
    total: documents.length,
    active: documents.filter((d) => d.status === 'ACTIVE').length,
    archived: documents.filter((d) => d.status === 'ARCHIVED').length,
    totalSize: documents.reduce((sum, d) => sum + d.fileSize, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-body font-medium text-danger-600">Failed to load documents</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Documents</h1>
        <p className="text-body text-text-secondary">
          Store, organize and collaborate on company documents.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Documents" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard label="Archived" value={stats.archived} tone="warning" />
        <StatCard label="Total Size" value={formatFileSize(stats.totalSize)} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full"
            />
          </div>

          <Dropdown
            trigger={
              <Button variant="outline">
                Sort
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'Recent', onClick: () => setSortBy('recent') },
              { label: 'Name', onClick: () => setSortBy('name') },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-1">
            <IconButton
              label="Grid view"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="List view"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <LayoutList className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Table view"
              variant={viewMode === 'table' ? 'solid' : 'ghost'}
              onClick={() => setViewMode('table')}
              className="h-8 w-8"
            >
              <Table className="h-4 w-4" />
            </IconButton>
          </div>

          <Button leftIcon={<Upload />} onClick={() => setModal({ type: 'upload' })}>
            Upload Document
          </Button>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No documents found"
          description="Try adjusting your search or upload a new document."
        />
      ) : viewMode === 'grid' ? (
        <GridView documents={filteredDocuments} onAction={setModal} onNavigate={navigate} />
      ) : viewMode === 'list' ? (
        <ListView documents={filteredDocuments} onAction={setModal} onNavigate={navigate} />
      ) : (
        <TableView documents={filteredDocuments} onAction={setModal} onNavigate={navigate} />
      )}

      {modal?.type === 'upload' && (
        <UploadDocumentModal
          isOpen
          onClose={() => setModal(null)}
          wsId={workspaceId}
          deptId={departmentId}
          projId={projectId}
        />
      )}
      {modal?.type === 'edit' && modal.doc && (
        <EditDocumentModal
          isOpen
          onClose={() => setModal(null)}
          wsId={workspaceId}
          deptId={departmentId}
          projId={projectId}
          document={modal.doc}
        />
      )}
      {modal?.type === 'delete' && modal.doc && (
        <DeleteDocumentModal
          isOpen
          onClose={() => setModal(null)}
          wsId={workspaceId}
          deptId={departmentId}
          projId={projectId}
          document={modal.doc}
        />
      )}
      {modal?.type === 'archive' && modal.doc && (
        <ArchiveDocumentModal
          isOpen
          onClose={() => setModal(null)}
          wsId={workspaceId}
          deptId={departmentId}
          projId={projectId}
          document={modal.doc}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'accent',
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  };

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone])}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function GridView({ documents, onAction, onNavigate }: {
  documents: DocumentResponse[];
  onAction: (m: { type: string; doc: DocumentResponse }) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onAction={onAction} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

const fileTypeEmoji: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  xlsx: '📊',
  pptx: '📈',
  img: '🖼️',
  zip: '📦',
  other: '📎',
};

function DocumentCard({ document, onAction, onNavigate }: {
  document: DocumentResponse;
  onAction: (m: { type: string; doc: DocumentResponse }) => void;
  onNavigate: (path: string) => void;
}) {
  const statusColor: Record<string, string> = {
    ACTIVE: 'success',
    ARCHIVED: 'neutral',
    DELETED: 'danger',
  };
  const icon = fileTypeEmoji[getFileIcon(document.mimeType)] ?? '📎';

  return (
    <Card className="hover:border-border-default transition-colors flex flex-col">
      <div
        className="h-32 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900 dark:to-accent-800 flex items-center justify-center border-b border-border-subtle cursor-pointer"
        onClick={() => onNavigate(`./${document.id}?ws=${document.projectId}`)}
      >
        <span className="text-5xl">{icon}</span>
      </div>

      <CardBody className="flex-1 space-y-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-body font-semibold text-text-primary truncate cursor-pointer hover:text-accent-600"
            onClick={() => onNavigate(`./${document.id}?ws=${document.projectId}`)}
          >
            {document.title}
          </h3>
          <p className="text-caption text-text-tertiary truncate">{document.fileName}</p>
        </div>

        <p className="text-caption text-text-secondary line-clamp-2">
          {document.description}
        </p>

        {document.tags && (
          <div className="flex flex-wrap gap-1">
            {document.tags.split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
              <Badge key={i} tone="accent" variant="soft">{tag.trim()}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
          <Badge tone={statusColor[document.status] as Tone} variant="soft">
            {document.status}
          </Badge>
          <div className="flex items-center gap-1">
            <IconButton label="View" variant="ghost" onClick={() => onNavigate(`./${document.id}`)}>
              <Eye className="h-4 w-4" />
            </IconButton>
            <IconButton label="Edit" variant="ghost" onClick={() => onAction({ type: 'edit', doc: document })}>
              <Edit2 className="h-4 w-4" />
            </IconButton>
            {document.status === 'ACTIVE' && (
              <IconButton label="Archive" variant="ghost" onClick={() => onAction({ type: 'archive', doc: document })}>
                <Archive className="h-4 w-4" />
              </IconButton>
            )}
            <IconButton label="Delete" variant="ghost" onClick={() => onAction({ type: 'delete', doc: document })}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ListView({ documents, onAction, onNavigate }: {
  documents: DocumentResponse[];
  onAction: (m: { type: string; doc: DocumentResponse }) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <ListRow key={doc.id} document={doc} onAction={onAction} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function ListRow({ document, onAction, onNavigate }: {
  document: DocumentResponse;
  onAction: (m: { type: string; doc: DocumentResponse }) => void;
  onNavigate: (path: string) => void;
}) {
  const statusColor: Record<string, string> = {
    ACTIVE: 'success',
    ARCHIVED: 'neutral',
    DELETED: 'danger',
  };
  const icon = fileTypeEmoji[getFileIcon(document.mimeType)] ?? '📎';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
      <div className="text-2xl">{icon}</div>
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onNavigate(`./${document.id}`)}
      >
        <h4 className="text-body font-medium text-text-primary truncate">{document.title}</h4>
        <p className="text-caption text-text-secondary">{document.fileName} • {formatFileSize(document.fileSize)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge tone={statusColor[document.status] as Tone} variant="soft">{document.status}</Badge>
        <span className="text-caption text-text-tertiary">v{document.version}</span>
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="View" variant="ghost" onClick={() => onNavigate(`./${document.id}`)}>
          <Eye className="h-4 w-4" />
        </IconButton>
        <IconButton label="Edit" variant="ghost" onClick={() => onAction({ type: 'edit', doc: document })}>
          <Edit2 className="h-4 w-4" />
        </IconButton>
        {document.status === 'ACTIVE' && (
          <IconButton label="Archive" variant="ghost" onClick={() => onAction({ type: 'archive', doc: document })}>
            <Archive className="h-4 w-4" />
          </IconButton>
        )}
        <IconButton label="Delete" variant="ghost" onClick={() => onAction({ type: 'delete', doc: document })}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

function TableView({ documents, onAction, onNavigate }: {
  documents: DocumentResponse[];
  onAction: (m: { type: string; doc: DocumentResponse }) => void;
  onNavigate: (path: string) => void;
}) {
  const statusColor: Record<string, string> = {
    ACTIVE: 'success',
    ARCHIVED: 'neutral',
    DELETED: 'danger',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Document</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Status</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Version</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Size</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Updated</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3">
                <div
                  className="cursor-pointer"
                  onClick={() => onNavigate(`./${doc.id}`)}
                >
                  <p className="text-body font-medium text-text-primary">{doc.title}</p>
                  <p className="text-caption text-text-tertiary">{doc.fileName}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusColor[doc.status] as Tone} variant="soft">{doc.status}</Badge>
              </td>
              <td className="px-4 py-3 text-body text-text-primary">v{doc.version}</td>
              <td className="px-4 py-3 text-body text-text-primary">{formatFileSize(doc.fileSize)}</td>
              <td className="px-4 py-3 text-body text-text-secondary">{formatDate(doc.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <IconButton label="View" variant="ghost" onClick={() => onNavigate(`./${doc.id}`)}>
                    <Eye className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Edit" variant="ghost" onClick={() => onAction({ type: 'edit', doc })}>
                    <Edit2 className="h-4 w-4" />
                  </IconButton>
                  {doc.status === 'ACTIVE' && (
                    <IconButton label="Archive" variant="ghost" onClick={() => onAction({ type: 'archive', doc })}>
                      <Archive className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton label="Delete" variant="ghost" onClick={() => onAction({ type: 'delete', doc })}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
