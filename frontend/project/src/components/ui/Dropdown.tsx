import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DropdownItem {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-[180px] rounded-lg border border-border-subtle bg-elevated p-1 shadow-cx-lg animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 h-px bg-border-subtle" />
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors text-left',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  item.danger
                    ? 'text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-100'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                {item.icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
                {item.label ?? ''}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
