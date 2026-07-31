import { useState, useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();
  return (
    <span
      className="relative inline-flex"
      aria-describedby={show ? tooltipId : undefined}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-2xs font-medium text-canvas dark:bg-text-primary dark:text-canvas shadow-cx-md pointer-events-none animate-fade-in',
            sideClasses[side],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
