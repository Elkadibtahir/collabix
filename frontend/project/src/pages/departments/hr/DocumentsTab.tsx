import { useState } from 'react';
import { FileText, Plus, X, Loader2, Check, Download, ShieldCheck, CalendarClock } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { Can } from '../../auth';
import { useEmployeesList } from '../../../services/employee-hooks';
import { useEmployeeDocuments, useEmployeeDocumentStats, useExpiringDocuments, useUploadEmployeeDocument, useVerifyEmployeeDocument, useUnverifyEmployeeDocument, useDeleteEmployeeDocument } from '../../../services/employee-document-hooks';
import type { EmployeeDocumentType } from '../../../services/employee-document-service';
import { EMPLOYEE_DOCUMENT_TYPES, employeeDocumentTypeLabel } from './hr-constants';

export function DocumentsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<EmployeeDocumentType>('CONTRACT');
  const [title, setTitle] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { toast } = useToast();
  const { data: empData } = useEmployeesList(wsId, deptId, 0, 100);
  const { data: docsData, isLoading } = useEmployeeDocuments(wsId, deptId, selectedEmp ?? undefined);
  const { data: stats } = useEmployeeDocumentStats(wsId, deptId, selectedEmp ?? undefined);
  const { data: expiringData } = useExpiringDocuments(wsId, deptId);
  const uploadDoc = useUploadEmployeeDocument(wsId, deptId, selectedEmp ?? '');
  const verifyDoc = useVerifyEmployeeDocument(wsId, deptId, selectedEmp ?? '');
  const unverifyDoc = useUnverifyEmployeeDocument(wsId, deptId, selectedEmp ?? '');
  const deleteDoc = useDeleteEmployeeDocument(wsId, deptId, selectedEmp ?? '');

  const employees = empData?.content ?? [];
  const docs = docsData?.content ?? [];
  const expiringDocs = expiringData ?? [];
  const empName = (id?: string) => {
    if (!id) return 'Employee';
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : 'Employee';
  };

  const handleUpload = () => {
    if (!selectedEmp || !file) return;
    uploadDoc.mutate({ file, documentType: type, title: title || undefined, expirationDate: expirationDate || undefined }, {
      onSuccess: () => {
        toast({ title: 'Document uploaded', tone: 'success' });
        setShowForm(false);
        setType('CONTRACT');
        setTitle('');
        setExpirationDate('');
        setFile(null);
      },
      onError: () => toast({ title: 'Failed to upload document', tone: 'danger' }),
    });
  };

  const downloadUrl = selectedEmp
    ? `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/workspaces/${wsId}/departments/${deptId}/employees/${selectedEmp}/documents/`
    : '';

  return (
    <div className="flex flex-col gap-4">
      {expiringDocs.length > 0 && (
        <Card>
          <CardBody className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-warning-600" />
              <span className="text-body font-semibold text-text-primary">Documents expiring soon</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {expiringDocs.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border border-border-subtle">
                  <div className="min-w-0">
                    <p className="text-caption font-medium text-text-primary">{d.title || d.originalFileName}</p>
                    <p className="text-2xs text-text-tertiary">{empName(d.employeeId)} • {employeeDocumentTypeLabel[d.documentType] ?? d.documentType}</p>
                  </div>
                  <Badge tone="warning" variant="soft">{d.expirationDate ?? '-'}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <select value={selectedEmp ?? ''} onChange={(e) => { setSelectedEmp(e.target.value || null); setShowForm(false); }}
          className="cx-input h-10 px-3 max-w-xs">
          <option value="">Select an employee...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
        {selectedEmp && (
          <Can permission="EMPLOYEE_DOCUMENT_UPLOAD">
            <Button leftIcon={<Plus />} size="sm" onClick={() => setShowForm(true)}>Upload Document</Button>
          </Can>
        )}
      </div>

      {!selectedEmp && (
        <EmptyState icon={<FileText />} title="Select an employee" description="Choose an employee to view and manage their documents." />
      )}

      {selectedEmp && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Total Documents</span>
            <span className="text-section font-bold text-text-primary">{stats.totalDocuments}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Verified</span>
            <span className="text-section font-bold text-success-600">{stats.verifiedCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Unverified</span>
            <span className="text-section font-bold text-warning-600">{stats.unverifiedCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Expiring</span>
            <span className="text-section font-bold text-danger-600">{stats.expiringCount}</span>
          </div>
        </div>
      )}

      {showForm && selectedEmp && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-semibold text-text-primary">Upload Document</h3>
              <IconButton label="Close" variant="ghost" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></IconButton>
            </div>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-caption" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={type} onChange={(e) => setType(e.target.value as EmployeeDocumentType)}
                options={EMPLOYEE_DOCUMENT_TYPES.map((t) => ({ value: t, label: employeeDocumentTypeLabel[t] ?? t }))} />
              <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="col-span-2">
                <Input placeholder="Expiration date (YYYY-MM-DD, optional)" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={!file}>Upload</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {selectedEmp && !showForm && (
        isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>
        ) : docs.length === 0 ? (
          <EmptyState icon={<FileText />} title="No documents" description="Upload documents to manage employee records." />
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-text-primary">{d.title || d.originalFileName}</p>
                  <p className="text-caption text-text-tertiary">
                    {employeeDocumentTypeLabel[d.documentType] ?? d.documentType} • v{d.fileVersion} • {formatBytes(d.fileSize)}
                    {d.expirationDate && ` • Exp: ${d.expirationDate}`}
                  </p>
                </div>
                {d.verified ? (
                  <Badge tone="success" variant="soft"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified</Badge>
                ) : (
                  <Badge tone="warning" variant="soft">Unverified</Badge>
                )}
                <div className="flex items-center gap-1">
                  <a href={downloadUrl + d.id + '/download'} target="_blank" rel="noreferrer">
                    <IconButton label="Download" variant="ghost" size="sm"><Download className="h-4 w-4" /></IconButton>
                  </a>
                  <Can permission="EMPLOYEE_DOCUMENT_VERIFY">
                    {d.verified ? (
                      <IconButton label="Unverify" variant="ghost" size="sm" onClick={() => unverifyDoc.mutate(d.id)}>
                        <Check className="h-4 w-4" />
                      </IconButton>
                    ) : (
                      <IconButton label="Verify" variant="ghost" size="sm" className="text-success-600" onClick={() => verifyDoc.mutate(d.id)}>
                        <ShieldCheck className="h-4 w-4" />
                      </IconButton>
                    )}
                  </Can>
                  <Can permission="EMPLOYEE_DOCUMENT_DELETE">
                    <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600"
                      onClick={() => deleteDoc.mutate(d.id, { onSuccess: () => toast({ title: 'Document deleted', tone: 'success' }) })}>
                      <X className="h-4 w-4" />
                    </IconButton>
                  </Can>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
