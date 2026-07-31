import { useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Download,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle,
  XCircle,
  Send,
  Edit2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Tone } from '../../../components/ui/Badge';
import {
  useDocumentDetail,
  useDeleteDocument,
  useArchiveDocument,
  useRestoreDocument,
  useSubmitForApproval,
  useApproveDocument,
  useRejectDocument,
} from '../../../services/document-hooks';
import { documentService } from '../../../services/document-service';
import { getFileIcon, formatFileSize, formatDate } from '../types/document-types';
import type { DocumentResponse } from '../types/document-types';

const statusTone: Record<DocumentResponse['status'], Tone> = {
  ACTIVE: 'success',
  ARCHIVED: 'warning',
  DELETED: 'danger',
};

const approvalTone: Record<string, Tone> = {
  pending: 'info',
  approved: 'success',
  rejected: 'danger',
};

const fileEmojiMap: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  xlsx: '📊',
  pptx: '📈',
  img: '🖼️',
  zip: '📦',
  other: '📎',
};

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-caption font-medium text-text-secondary mb-0.5">{label}</p>
      <div className="text-body text-text-primary break-words">{value ?? '—'}</div>
    </div>
  );
}

export function DocumentDetailPage() {
  const { docId } = useParams<{ docId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const workspaceId = searchParams.get('ws') ?? '';
  const departmentId = searchParams.get('dept') ?? '';
  const projectId = searchParams.get('proj') ?? '';

  const { data: document, isLoading, isError } = useDocumentDetail(
    workspaceId, departmentId, projectId, docId,
  );

  const deleteMutation = useDeleteDocument(workspaceId, departmentId, projectId);
  const archiveMutation = useArchiveDocument(workspaceId, departmentId, projectId);
  const restoreMutation = useRestoreDocument(workspaceId, departmentId, projectId);
  const submitApprovalMutation = useSubmitForApproval(workspaceId, departmentId, projectId);
  const approveMutation = useApproveDocument(workspaceId, departmentId, projectId);
  const rejectMutation = useRejectDocument(workspaceId, departmentId, projectId);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = (fn: () => Promise<unknown>) => {
    setActionError(null);
    fn().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Action failed';
      setActionError(message);
    });
  };

  const handleDelete = () => {
    if (!docId) return;
    handleAction(async () => {
      await deleteMutation.mutateAsync(docId);
      navigate('../documents');
    });
  };

  const handleArchive = () => {
    if (!docId) return;
    handleAction(async () => {
      await archiveMutation.mutateAsync(docId);
    });
  };

  const handleRestore = () => {
    if (!docId) return;
    handleAction(async () => {
      await restoreMutation.mutateAsync(docId);
    });
  };

  const handleSubmitApproval = () => {
    if (!docId) return;
    handleAction(async () => {
      await submitApprovalMutation.mutateAsync(docId);
    });
  };

  const handleApprove = () => {
    if (!docId) return;
    handleAction(async () => {
      await approveMutation.mutateAsync(docId);
    });
  };

  const handleReject = () => {
    if (!docId) return;
    handleAction(async () => {
      await rejectMutation.mutateAsync(docId);
    });
  };

  const handleDownload = () => {
    if (!docId) return;
    const url = documentService.download(workspaceId, departmentId, projectId, docId);
    window.open(url, '_blank');
  };

  const isMutating = deleteMutation.isPending
    || archiveMutation.isPending
    || restoreMutation.isPending
    || submitApprovalMutation.isPending
    || approveMutation.isPending
    || rejectMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-body font-medium text-danger-600">Failed to load document</p>
        <p className="text-caption text-text-tertiary">The document could not be found or you do not have access.</p>
        <Button variant="outline" onClick={() => navigate('../documents')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const fileIcon = fileEmojiMap[getFileIcon(document.mimeType)] ?? fileEmojiMap.other;
  const isActive = document.status === 'ACTIVE';
  const isArchived = document.status === 'ARCHIVED';
  const approvalStatus = document.approvalStatus;
  const canSubmitForApproval = isActive && (!approvalStatus || approvalStatus === 'rejected');
  const canApproveOrReject = isActive && approvalStatus === 'pending';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('../documents')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-page font-semibold text-text-primary truncate">{document.title}</h1>
          <p className="text-body text-text-secondary flex items-center gap-2">
            <span className="truncate">{document.fileName}</span>
            <span className="shrink-0 text-lg">{fileIcon}</span>
          </p>
        </div>
      </div>

      {actionError && (
        <Card className="border-danger-200 dark:border-danger-800">
          <CardBody className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-caption font-medium text-danger-700 dark:text-danger-200">Action failed</p>
              <p className="text-2xs text-danger-600 dark:text-danger-300">{actionError}</p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <MetaItem
              label="Status"
              value={
                <Badge tone={statusTone[document.status]} variant="soft">
                  {document.status}
                </Badge>
              }
            />
            <MetaItem label="Version" value={`v${document.version}`} />
            <MetaItem label="Size" value={formatFileSize(document.fileSize)} />
            {document.category && (
              <MetaItem label="Category" value={document.category} />
            )}
            {document.tags && (
              <MetaItem label="Tags" value={document.tags} />
            )}
            <MetaItem label="Created" value={formatDate(document.createdAt)} />
            <MetaItem label="Modified" value={formatDate(document.updatedAt)} />
            <MetaItem label="Views" value={String(document.viewCount)} />
            {approvalStatus && (
              <MetaItem
                label="Approval"
                value={
                  <Badge tone={approvalTone[approvalStatus] ?? 'neutral'} variant="soft">
                    {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                  </Badge>
                }
              />
            )}
            <MetaItem label="Created by" value={document.createdBy} />
            <MetaItem label="Updated by" value={document.updatedBy} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {isActive && (
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleDownload}>
                Download
              </Button>
            )}
            {isActive && (
              <Button variant="outline" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`../documents/${docId}/edit`)}>
                Edit
              </Button>
            )}
            {isActive && (
              <Button variant="outline" size="sm" leftIcon={<Archive className="h-4 w-4" />} onClick={handleArchive} disabled={isMutating}>
                Archive
              </Button>
            )}
            {isArchived && (
              <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={handleRestore} disabled={isMutating}>
                Restore
              </Button>
            )}
            {(isActive || isArchived) && (
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleDelete} disabled={isMutating}>
                Delete
              </Button>
            )}
            {canSubmitForApproval && (
              <Button variant="primary" size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={handleSubmitApproval} disabled={isMutating}>
                Submit for Approval
              </Button>
            )}
            {canApproveOrReject && (
              <>
                <Button variant="success" size="sm" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={handleApprove} disabled={isMutating}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={handleReject} disabled={isMutating}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {document.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-body text-text-primary whitespace-pre-wrap">{document.description}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
