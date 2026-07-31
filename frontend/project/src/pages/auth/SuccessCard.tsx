import { CheckCircle2, Loader2 } from 'lucide-react';

export interface SuccessCardProps {
  title: string;
  description: string;
  redirectText?: string;
}

export function SuccessCard({ title, description, redirectText }: SuccessCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center animate-scale-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-500">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div>
        <p className="text-page font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-body text-text-secondary">{description}</p>
      </div>
      {redirectText && (
        <div className="mt-2 flex items-center gap-2 text-caption text-text-tertiary">
          <Loader2 className="h-3.5 w-3.5 animate-cx-spin" />
          {redirectText}
        </div>
      )}
    </div>
  );
}
