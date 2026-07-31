import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

export interface SessionExpiredDialogProps {
  open: boolean;
  onDismiss?: () => void;
}

export function SessionExpiredDialog({ open, onDismiss }: SessionExpiredDialogProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  const focusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onDismiss) onDismiss();
      focusTrap(e);
    };
    document.addEventListener('keydown', handleKey);
    const timer = setTimeout(() => {
      const btn = dialogRef.current?.querySelector<HTMLElement>('button');
      btn?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(timer);
    };
  }, [open, onDismiss, focusTrap]);

  useEffect(() => {
    if (open && onDismiss) {
      const handleClick = (e: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          onDismiss();
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/40 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-description"
    >
      <div
        ref={dialogRef}
        className={cn(
          'w-full max-w-sm rounded-2xl border border-border-subtle bg-elevated shadow-cx-lg',
          'px-6 py-8 sm:px-8 sm:py-10 animate-scale-in',
        )}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="self-end -mt-2 -mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 text-warning-500">
            <Clock className="h-8 w-8" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 id="session-expired-title" className="text-page font-bold text-text-primary tracking-tight">
              Session Expired
            </h2>
            <p id="session-expired-description" className="text-body text-text-secondary leading-relaxed">
              Your session has expired. Please sign in again to continue.
            </p>
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
