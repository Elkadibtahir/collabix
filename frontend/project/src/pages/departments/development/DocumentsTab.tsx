import { DeptDocuments } from '../common/DeptDocuments';

export function DevelopmentDocumentsTab() {
  return (
    <DeptDocuments data={{
      categories: ['API Docs', 'Architecture', 'Runbooks', 'Specifications', 'Templates'],
      documents: [
        { id: 'd1', title: 'API Reference v3.2', type: 'MD', category: 'API Docs', version: 5, updatedBy: 'David Wu', updatedAt: '1d ago' },
        { id: 'd2', title: 'System Architecture Overview', type: 'PDF', category: 'Architecture', version: 3, updatedBy: 'Alex Kovac', updatedAt: '3d ago' },
        { id: 'd3', title: 'Deployment Playbook', type: 'MD', category: 'Runbooks', version: 7, updatedBy: 'Maya Mishra', updatedAt: '5d ago' },
        { id: 'd4', title: 'Frontend Style Guide', type: 'DOCX', category: 'Templates', version: 2, updatedBy: 'Sarah Nelson', updatedAt: '1w ago' },
        { id: 'd5', title: 'Sprint 24 Release Notes', type: 'MD', category: 'Specifications', version: 1, updatedBy: 'David Wu', updatedAt: '2d ago' },
        { id: 'd6', title: 'PRD: Dashboard Redesign', type: 'DOCX', category: 'Specifications', version: 4, updatedBy: 'Sarah Nelson', updatedAt: '4d ago' },
      ],
    }} />
  );
}
