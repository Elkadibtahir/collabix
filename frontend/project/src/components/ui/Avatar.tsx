import { cn } from '../../lib/cn';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  xs: 'h-5 w-5 text-2xs',
  sm: 'h-7 w-7 text-caption',
  md: 'h-9 w-9 text-body',
  lg: 'h-11 w-11 text-body-lg',
};

const toneClasses = [
  'bg-accent-100 text-accent-700 dark:bg-accent-100 dark:text-accent-200',
  'bg-success-100 text-success-700 dark:bg-success-100 dark:text-success-700',
  'bg-warning-100 text-warning-700 dark:bg-warning-100 dark:text-warning-700',
  'bg-danger-100 text-danger-700 dark:bg-danger-100 dark:text-danger-700',
  'bg-info-100 text-info-700 dark:bg-info-100 dark:text-info-700',
  'bg-surface-2 text-text-secondary',
];

function hashIndex(name: string, len: number) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return Math.abs(hash) % len;
}

export interface AvatarProps {
  name: string;
  src?: string;
  size?: Size;
  tone?: number;
  className?: string;
  ring?: boolean;
}

export function Avatar({ name, src, size = 'md', tone, className, ring }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const toneClass = toneClasses[tone ?? hashIndex(name, toneClasses.length)];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold overflow-hidden',
        sizeClasses[size],
        toneClass,
        ring && 'ring-2 ring-canvas dark:ring-surface',
        className,
      )}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function AvatarGroup({ max = 4, size = 'sm', names, className }: { max?: number; size?: Size; names: string[]; className?: string }) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;
  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visible.map((n, i) => (
        <Avatar key={i} name={n} size={size} ring tone={i % 6} />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-surface-2 text-text-secondary font-semibold ring-2 ring-canvas dark:ring-surface',
            sizeClasses[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
