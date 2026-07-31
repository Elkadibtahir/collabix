import { useMemo, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search as SearchIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Checkbox } from './Checkbox';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selected: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  maxHeight?: string;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  className,
  stickyHeader = true,
  maxHeight,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKeys(r).toLowerCase().includes(q));
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize],
  );

  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected.has(rowKey(r)));
  const someOnPageSelected = paged.some((r) => selected.has(rowKey(r)));

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onSelectionChange?.([...next]);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paged.forEach((r) => next.delete(rowKey(r)));
      } else {
        paged.forEach((r) => next.add(rowKey(r)));
      }
      onSelectionChange?.([...next]);
      return next;
    });
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {searchable && (
        <div className="mb-3 relative max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="cx-input h-9 pl-9"
          />
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-accent-200 dark:border-accent-100 bg-accent-50 dark:bg-accent-100 px-4 py-2">
          <span className="text-body font-medium text-accent-700 dark:text-accent-200">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={() => {
              setSelected(new Set());
              onSelectionChange?.([]);
            }}
            className="text-caption font-medium text-accent-700 dark:text-accent-200 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-border-subtle" style={{ maxHeight }}>
        <table className="w-full border-collapse">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="border-b border-border-subtle bg-surface">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all on page"
                  />
                </th>
              )}
              {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn(
                    'px-3 py-2.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    !col.align && 'text-left',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-text-secondary transition-colors',
                        col.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {col.header}
                      {sortKey === col.key && sortDir === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : sortKey === col.key && sortDir === 'desc' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => {
              const key = rowKey(row);
              const isSel = selected.has(key);
              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b border-border-subtle transition-colors',
                    isSel ? 'bg-accent-50/50 dark:bg-accent-100/20' : 'hover:bg-surface',
                  )}
                >
                  {selectable && (
                    <td className="px-3 py-3">
                      <Checkbox checked={isSel} onChange={() => toggleRow(key)} aria-label={`Select row ${key}`} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-3 text-body text-text-primary',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {paged.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            icon={<SearchIcon />}
            className="py-10"
          />
        )}
      </div>

      {sorted.length > pageSize && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-caption text-text-tertiary">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
