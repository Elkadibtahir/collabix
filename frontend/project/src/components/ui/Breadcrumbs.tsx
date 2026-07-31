import { Fragment, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {item.onClick && !isLast ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="inline-flex items-center gap-1.5 rounded text-caption text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {item.icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
                    {item.label}
                  </button>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-caption',
                      isLast ? 'text-text-primary font-medium' : 'text-text-tertiary',
                    )}
                  >
                    {item.icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className="h-3 w-3 text-text-tertiary shrink-0" />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
