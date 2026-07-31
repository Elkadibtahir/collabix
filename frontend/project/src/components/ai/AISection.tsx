import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AISectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function AISection({ title, description, action, className, children }: AISectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-section font-semibold text-text-primary">{title}</h2>
          {description && <p className="mt-0.5 text-caption text-text-tertiary">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
