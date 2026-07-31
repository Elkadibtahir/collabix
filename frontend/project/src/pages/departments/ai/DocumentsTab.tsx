import { DeptDocuments } from '../common/DeptDocuments';

export function AIDocumentsTab() {
  return (
    <DeptDocuments data={{
      categories: ['Research Papers', 'Models', 'Datasets', 'Notebooks', 'Reports'],
      documents: [
        { id: 'd1', title: 'LLM Fine-tuning Research Paper', type: 'PDF', category: 'Research Papers', version: 3, updatedBy: 'Pete Briggs', updatedAt: '2d ago' },
        { id: 'd2', title: 'Customer Chatbot v2 - Model Card', type: 'MD', category: 'Models', version: 2, updatedBy: 'Mark Kim', updatedAt: '4d ago' },
        { id: 'd3', title: 'Training Dataset - Customer Queries', type: 'CSV', category: 'Datasets', version: 5, updatedBy: 'Anna Chen', updatedAt: '1w ago' },
        { id: 'd4', title: 'Document Classification Notebook', type: 'IPYNB', category: 'Notebooks', version: 7, updatedBy: 'Anna Chen', updatedAt: '3d ago' },
        { id: 'd5', title: 'Monthly ML Experiment Report', type: 'PDF', category: 'Reports', version: 1, updatedBy: 'Mark Kim', updatedAt: '5d ago' },
        { id: 'd6', title: 'Innovation Pipeline Report', type: 'DOCX', category: 'Reports', version: 2, updatedBy: 'Dr. Rachel Lin', updatedAt: '1w ago' },
      ],
    }} />
  );
}
