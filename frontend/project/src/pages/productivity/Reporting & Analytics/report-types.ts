export type ReportType = 
  | 'workspace' 
  | 'department' 
  | 'team' 
  | 'project' 
  | 'productivity' 
  | 'knowledge' 
  | 'documents' 
  | 'activity' 
  | 'handover' 
  | 'notification';

export type ReportStatus = 'draft' | 'generated' | 'pending' | 'failed' | 'cancelled';
export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'print';

export interface ReportMetadata {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  workspace?: string;
  department?: string;
  team?: string;
  project?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  tags: string[];
  size?: number;
  pages?: number;
  isFavorite: boolean;
  isShared: boolean;
  sharedWith?: string[];
}

export interface ReportContent {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
  sections: ReportSection[];
  metadata: ReportMetadata;
  attachments?: ReportAttachment[];
  relatedReports?: string[];
}

export interface ReportSection {
  id: string;
  type: 'summary' | 'statistics' | 'charts' | 'tables' | 'timeline' | 'details';
  title: string;
  content: unknown;
  order: number;
}

export interface ReportAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  preview?: string;
  includedSections: string[];
  estimatedTime: string;
  isFavorite: boolean;
  usageCount: number;
}

export interface ReportExport {
  id: string;
  reportId: string;
  reportName: string;
  format: ExportFormat;
  fileSize: number;
  generatedAt: string;
  generatedBy: string;
  downloadUrl?: string;
  status: 'success' | 'pending' | 'failed';
}

export interface ReportHistoryEntry {
  id: string;
  reportId: string;
  reportName: string;
  type: 'generated' | 'exported' | 'downloaded' | 'viewed' | 'shared' | 'favorited';
  timestamp: string;
  actor: string;
  details?: string;
}

export interface ReportFilter {
  search?: string;
  type?: ReportType;
  status?: ReportStatus;
  workspace?: string;
  department?: string;
  team?: string;
  project?: string;
  author?: string;
  dateRange?: { start: string; end: string };
  tags?: string[];
  isFavorite?: boolean;
}

export interface ReportBuilderState {
  title: string;
  description: string;
  type: ReportType;
  workspace?: string;
  department?: string;
  team?: string;
  project?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  sections: {
    summary: boolean;
    statistics: boolean;
    charts: boolean;
    tables: boolean;
    timeline: boolean;
    knowledge: boolean;
    documents: boolean;
    handover: boolean;
    activity: boolean;
  };
  isDraft: boolean;
}
