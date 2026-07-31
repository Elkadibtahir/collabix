import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';

export function ReportDetailsPage({ reportId, onBack }: { reportId: string; onBack?: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <h1 className="text-page font-semibold text-text-primary">Report Details</h1>
      </div>
      <Card>
        <CardBody className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-10 w-10 text-text-tertiary mb-3" />
            <p className="text-body font-medium text-text-primary">Report not yet available</p>
            <p className="text-caption text-text-tertiary mt-1">Report data will appear once the backend provides it.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
