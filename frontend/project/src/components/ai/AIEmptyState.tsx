import { type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export interface AIEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function AIEmptyState({ icon, title, description, actionLabel, onAction, className }: AIEmptyStateProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={actionLabel && onAction ? <Button size="sm" onClick={onAction}>{actionLabel}</Button> : undefined}
      className={className}
    />
  );
}
