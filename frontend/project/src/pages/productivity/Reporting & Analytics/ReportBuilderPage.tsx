import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  X,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Badge } from '../../../components/ui/Badge';
import type { ReportBuilderState } from './report-types';

export function ReportBuilderPage({ onBack, onGenerate }: { onBack?: () => void; onGenerate?: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<ReportBuilderState>({
    title: '',
    description: '',
    type: 'workspace',
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    sections: {
      summary: true,
      statistics: true,
      charts: true,
      tables: true,
      timeline: false,
      knowledge: false,
      documents: false,
      handover: false,
      activity: false,
    },
    isDraft: false,
  });

  const handleGenerate = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onGenerate?.();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardBody className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success-600" />
              </div>
            </div>
            <h2 className="text-section font-semibold text-text-primary">
              Report Submitted!
            </h2>
            <p className="text-body text-text-secondary">
              Your report has been queued for generation. You'll be notified when it's ready.
            </p>
            <div className="pt-4">
              <p className="text-caption text-text-tertiary">Redirecting...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-page font-semibold text-text-primary">Create New Report</h1>
          <p className="text-body text-text-secondary">
            Configure and generate a custom report for your workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-caption font-semibold text-text-secondary mb-2 block">
                  Report Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., October 2024 Performance Report"
                />
              </div>

              <div>
                <label className="text-caption font-semibold text-text-secondary mb-2 block">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report will contain..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-caption font-semibold text-text-secondary mb-2 block">
                  Report Type
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="workspace">Workspace Report</option>
                  <option value="department">Department Report</option>
                  <option value="team">Team Report</option>
                  <option value="project">Project Report</option>
                  <option value="productivity">Productivity Report</option>
                  <option value="knowledge">Knowledge Report</option>
                  <option value="documents">Documents Report</option>
                  <option value="activity">Activity Report</option>
                  <option value="handover">Handover Report</option>
                  <option value="notification">Notification Report</option>
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Time Period</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption font-semibold text-text-secondary mb-2 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dateRange.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, startDate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-caption font-semibold text-text-secondary mb-2 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dateRange.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, endDate: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Report Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Include Sections</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <SectionCheckbox
                label="Executive Summary"
                description="High-level overview and key findings"
                checked={formData.sections.summary}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, summary: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Statistics & Metrics"
                description="Detailed performance metrics and KPIs"
                checked={formData.sections.statistics}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, statistics: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Charts & Visualizations"
                description="Visual representations of data"
                checked={formData.sections.charts}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, charts: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Detailed Tables"
                description="In-depth data tables and records"
                checked={formData.sections.tables}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, tables: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Activity Timeline"
                description="Chronological activity log"
                checked={formData.sections.timeline}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, timeline: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Knowledge Base Data"
                description="Articles, contributions and engagement"
                checked={formData.sections.knowledge}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, knowledge: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Documents Summary"
                description="Document repository and usage"
                checked={formData.sections.documents}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, documents: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Handover Information"
                description="Work handover and shift summaries"
                checked={formData.sections.handover}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, handover: checked },
                  }))
                }
              />
              <SectionCheckbox
                label="Activity Summary"
                description="User activity and engagement metrics"
                checked={formData.sections.activity}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, activity: checked },
                  }))
                }
              />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Preview & Actions */}
        <div className="space-y-4">
          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <ConfigRow label="Type" value={formData.type} />
              <ConfigRow
                label="Date Range"
                value={`${formData.dateRange.startDate} to ${formData.dateRange.endDate}`}
              />
              <ConfigRow
                label="Sections"
                value={Object.values(formData.sections).filter(Boolean).length.toString()}
              />
            </CardBody>
          </Card>

          {/* Estimated Info */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated Output</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              <EstimateRow label="Pages" value="8-15" />
              <EstimateRow label="Generation Time" value="2-5 min" />
              <EstimateRow label="File Size" value="1-3 MB" />
            </CardBody>
          </Card>

          {/* Selected Sections Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-body">Included Sections</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-1">
                {Object.entries(formData.sections)
                  .filter(([, checked]) => checked)
                  .map(([key]) => (
                    <Badge key={key} tone="success" variant="soft">
                      {key}
                    </Badge>
                  ))}
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="space-y-2 sticky bottom-6">
            <Button variant="outline" fullWidth onClick={onBack}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setFormData((prev) => ({ ...prev, isDraft: true }))}
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button fullWidth onClick={handleGenerate}>
              <Send className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCheckbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-2 cursor-pointer transition-colors">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-primary">{label}</p>
        <p className="text-caption text-text-secondary mt-0.5">{description}</p>
      </div>
    </label>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle last:pb-0 last:border-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-caption font-medium text-text-primary truncate">{value}</span>
    </div>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-caption font-medium text-text-primary">{value}</span>
    </div>
  );
}
