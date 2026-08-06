import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/cn';

type ToastTone = 'success' | 'warning' | 'danger' | 'info' | 'error';

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneConfig: Record<ToastTone, { icon: ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-success-500' },
  warning: { icon: <AlertCircle className="h-5 w-5" />, color: 'text-warning-500' },
  danger: { icon: <XCircle className="h-5 w-5" />, color: 'text-danger-500' },
  error: { icon: <XCircle className="h-5 w-5" />, color: 'text-danger-500' },
  info: { icon: <Info className="h-5 w-5" />, color: 'text-info-500' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
          {toasts.map((t) => {
            const cfg = toneConfig[t.tone];
            return (
              <div
                key={t.id}
                className="flex items-start gap-3 rounded-lg border border-border-subtle bg-elevated p-4 shadow-cx-lg animate-slide-in-right"
                role="alert"
              >
                <span className={cn('shrink-0 mt-0.5', cfg.color)}>{cfg.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-text-primary">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-caption text-text-tertiary">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
