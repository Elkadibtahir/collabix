import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type CardVariant = 'default' | 'inner' | 'hover';

const cardVariants: Record<CardVariant, string> = {
  default: 'cx-card',
  inner: 'cx-card border border-border-subtle bg-surface',
  hover: 'cx-card cx-card-hover',
};

export function Card({ className, variant = 'default', ...props }: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return <div className={cn(cardVariants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 px-5 py-4 border-b border-border-subtle', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn('text-section font-bold text-text-primary tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-caption text-text-tertiary mt-0.5', className)}>{children}</p>;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 px-5 py-3 border-t border-border-subtle', className)}
      {...props}
    />
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-section font-bold text-text-primary tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-caption text-text-tertiary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ViewToggle<T extends string>({ mode, modes, onChange }: { mode: T; modes: { id: T; label: string }[]; onChange: (m: T) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-caption font-medium transition-colors',
            mode === m.id ? 'bg-accent-600 text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
