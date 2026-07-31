import { cn } from '../../lib/cn';

const levels = [
  { label: 'Weak', color: 'text-danger-500', bar: 'bg-danger-500' },
  { label: 'Fair', color: 'text-warning-500', bar: 'bg-warning-500' },
  { label: 'Good', color: 'text-info-500', bar: 'bg-info-500' },
  { label: 'Strong', color: 'text-success-500', bar: 'bg-success-500' },
  { label: 'Excellent', color: 'text-success-600', bar: 'bg-success-600' },
];

function evaluate(password: string): { score: number; level: number } {
  if (!password) return { score: 0, level: -1 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 16 && /[^A-Za-z0-9]/.test(password) && /\d/.test(password)) score++;
  return { score, level: Math.min(score - 1, 4) };
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;
  const { score, level } = evaluate(password);
  const current = levels[Math.max(0, level)];

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-1.5 flex-1 gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-full flex-1 rounded-full transition-colors duration-200',
              i < score ? current.bar : 'bg-border-subtle',
            )}
          />
        ))}
      </div>
      <span className={cn('text-2xs font-medium w-16 text-right', current.color)}>
        {current.label}
      </span>
    </div>
  );
}
