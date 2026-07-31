import { DeptDocuments } from '../common/DeptDocuments';

export function CybersecurityDocumentsTab() {
  return (
    <DeptDocuments data={{
      categories: ['Policies', 'Audit Reports', 'Compliance', 'Runbooks', 'Training'],
      documents: [
        { id: 'd1', title: 'Incident Response Plan v4', type: 'PDF', category: 'Policies', version: 4, updatedBy: 'Ahmed Hassan', updatedAt: '1d ago' },
        { id: 'd2', title: 'SOC 2 Audit Report Q2', type: 'PDF', category: 'Audit Reports', version: 1, updatedBy: 'James Doe', updatedAt: '3d ago' },
        { id: 'd3', title: 'Access Control Policy', type: 'DOCX', category: 'Policies', version: 6, updatedBy: 'Ahmed Hassan', updatedAt: '1w ago' },
        { id: 'd4', title: 'Security Runbook - Ransomware', type: 'MD', category: 'Runbooks', version: 2, updatedBy: 'Sofia Cruz', updatedAt: '2w ago' },
        { id: 'd5', title: 'Compliance Checklist ISO 27001', type: 'XLSX', category: 'Compliance', version: 3, updatedBy: 'James Doe', updatedAt: '2d ago' },
        { id: 'd6', title: 'Security Awareness Training Deck', type: 'PPTX', category: 'Training', version: 5, updatedBy: 'Lisa Kim', updatedAt: '5d ago' },
      ],
    }} />
  );
}
