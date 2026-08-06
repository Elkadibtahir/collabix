import { useState, useCallback, useMemo } from 'react';
import type { Pageable, SortField, SortDirection, PageMetadata } from '../types/api';

export interface PaginationConfig {
  initialPage?: number;
  initialSize?: number;
  initialSort?: SortField[];
}

export function usePagination(config: PaginationConfig = {}) {
  const [page, setPage] = useState(config.initialPage ?? 0);
  const [size, setSize] = useState(config.initialSize ?? 20);
  const [sortFields, setSortFields] = useState<SortField[]>(config.initialSort ?? []);
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);

  const pageable: Pageable = useMemo(
    () => ({ page, size, sort: sortFields.map((s) => `${s.field},${s.direction}`) }),
    [page, size, sortFields],
  );

  const resetPage = useCallback(() => setPage(0), []);

  const nextPage = useCallback(() => {
    if (metadata && !metadata.last) setPage((p) => p + 1);
  }, [metadata]);

  const prevPage = useCallback(() => {
    if (metadata && !metadata.first) setPage((p) => Math.max(0, p - 1));
  }, [metadata]);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(0, p));
  }, []);

  const changeSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const toggleSort = useCallback(
    (field: string) => {
      setSortFields((prev) => {
        const existing = prev.find((s) => s.field === field);
        if (!existing) return [{ field, direction: 'asc' as SortDirection }];
        if (existing.direction === 'asc') return [{ field, direction: 'desc' as SortDirection }];
        return [];
      });
      setPage(0);
    },
    [],
  );

  const setSort = useCallback((fields: SortField[]) => {
    setSortFields(fields);
    setPage(0);
  }, []);

  const syncMetadata = useCallback((meta: PageMetadata) => {
    setMetadata(meta);
  }, []);

  const from = metadata ? metadata.page * metadata.size + 1 : 0;
  const to = metadata ? Math.min((metadata.page + 1) * metadata.size, metadata.totalElements) : 0;

  return {
    page,
    size,
    pageable,
    sortFields,
    metadata,
    from,
    to,
    setPage: goToPage,
    nextPage,
    prevPage,
    resetPage,
    changeSize,
    toggleSort,
    setSort,
    syncMetadata,
  };
}

export type PaginationControls = ReturnType<typeof usePagination>;
