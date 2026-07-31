export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedAction: string;
}

export interface Source {
  id: string;
  title: string;
  type: string;
  path: string;
}

export interface RelatedReport {
  id: string;
  title: string;
  category: string;
  date: string;
}

export interface ReportViewerData {
  id: string;
  title: string;
  generatedDate: string;
  workspace: string;
  department: string;
  category: string;
  status: 'completed' | 'draft';
  summary: string;
  insights: Insight[];
  recommendations: Recommendation[];
  sources: Source[];
  relatedReports: RelatedReport[];
}

export const chartTypes = [
  { id: 'bar', label: 'Bar Chart', description: 'Compare values across categories' },
  { id: 'line', label: 'Line Chart', description: 'Show trends over time' },
  { id: 'pie', label: 'Pie Chart', description: 'Display proportion distribution' },
  { id: 'area', label: 'Area Chart', description: 'Emphasize magnitude of change' },
  { id: 'trend', label: 'Trend Chart', description: 'Highlight performance direction' },
  { id: 'heatmap', label: 'Heat Map', description: 'Visualize density and patterns' },
] as const;
