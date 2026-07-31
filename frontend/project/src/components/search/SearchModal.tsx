import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, FolderKanban, CheckSquare, Users, Settings, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Skeleton } from '../ui/Skeleton';

/* ---------- Types ---------- */

export type SearchEntityType = 'project' | 'task' | 'document' | 'team' | 'settings';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: SearchEntityType;
  url: string;
  badge?: string;
}

export interface SearchGroup {
  label: string;
  items: SearchItem[];
}

type SearchFilter = 'all' | SearchEntityType;

/* ---------- Mock data ---------- */

const mockGroups: SearchGroup[] = [];

const allSettings: SearchItem[] = [];

/* ---------- Helpers ---------- */

const filterLabel: Record<SearchFilter, string> = {
  all: 'All',
  project: 'Projects',
  task: 'Tasks',
  document: 'Documents',
  team: 'Teams',
  settings: 'Settings',
};

const typeIcon: Record<SearchEntityType, ReactNode> = {
  project: <FolderKanban className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

const typeColor: Record<SearchEntityType, string> = {
  project: 'text-accent-600 dark:text-accent-400',
  task: 'text-warning-600 dark:text-warning-400',
  document: 'text-info-600 dark:text-info-400',
  team: 'text-success-600 dark:text-success-400',
  settings: 'text-text-tertiary',
};

function normalize(q: string) {
  return q.toLowerCase().trim();
}

function matches(item: SearchItem, query: string) {
  const nq = normalize(query);
  return normalize(item.title).includes(nq) || normalize(item.description).includes(nq);
}

/* ---------- localStorage for recent searches ---------- */

const RECENT_KEY = 'cx-recent-searches';
const MAX_RECENT = 5;

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecent(query: string) {
  const list = getRecent().filter((q) => q !== query);
  list.unshift(query);
  if (list.length > MAX_RECENT) list.length = MAX_RECENT;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch { /* ignore */ }
}

/* ---------- Filter pills ---------- */

const filters: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'project', label: 'Projects' },
  { value: 'task', label: 'Tasks' },
  { value: 'document', label: 'Documents' },
  { value: 'team', label: 'Teams' },
  { value: 'settings', label: 'Settings' },
];

function FilterBar({
  active,
  onChange,
}: {
  active: SearchFilter;
  onChange: (f: SearchFilter) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-3 scrollbar-none">
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-caption font-medium transition-colors',
            active === f.value
              ? 'bg-accent-600 text-white'
              : 'bg-surface-2 text-text-secondary hover:bg-border-subtle hover:text-text-primary',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Recent searches ---------- */

function RecentSearches({ onSelect, onClear }: { onSelect: (q: string) => void; onClear: () => void }) {
  const items = getRecent();
  if (items.length === 0) return null;

  return (
    <div className="px-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">Recent</p>
        <button
          type="button"
          onClick={onClear}
          className="text-2xs font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-caption text-text-secondary hover:bg-border-subtle hover:text-text-primary transition-colors"
          >
            <Clock className="h-3 w-3" />
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Result item ---------- */

function ResultItem({
  item,
  selected,
  index,
  onHover,
  onClick,
}: {
  item: SearchItem;
  selected: boolean;
  index: number;
  onHover: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`search-option-${index}`}
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        selected ? 'bg-accent-600/10 dark:bg-accent-100/15' : 'hover:bg-surface-2',
      )}
    >
      <span className={cn('shrink-0', typeColor[item.type])}>{typeIcon[item.type]}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-body font-medium text-text-primary truncate">{item.title}</span>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-accent-50 px-1.5 py-0.5 text-2xs font-medium text-accent-600 dark:bg-accent-100 dark:text-accent-300">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-caption text-text-tertiary truncate">{item.description}</p>
      </div>
      <span className="shrink-0 text-2xs text-text-tertiary">{filterLabel[item.type]}</span>
    </button>
  );
}

/* ---------- Result groups ---------- */

function ResultGroups({
  groups,
  selectedIndex,
  onSelect,
}: {
  groups: SearchGroup[];
  selectedIndex: number;
  onSelect: (item: SearchItem) => void;
}) {
  let globalIdx = 0;

  return (
    <div className="px-3 pb-2">
      {groups.map((group) => {
        const startIdx = globalIdx;
        globalIdx += group.items.length;
        return (
          <div key={group.label} className="mb-2 last:mb-0">
            <p className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
              {group.label}
            </p>
            {group.items.map((item, idx) => {
              const itemIdx = startIdx + idx;
              return (
                <ResultItem
                  key={item.id}
                  item={item}
                  index={itemIdx}
                  selected={selectedIndex === itemIdx}
                  onHover={() => { /* keyboard nav handles this */ }}
                  onClick={() => onSelect(item)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 mb-3">
        <Search className="h-5 w-5 text-text-tertiary" />
      </div>
      <p className="text-body font-medium text-text-primary mb-1">No results for "{query}"</p>
      <p className="text-caption text-text-tertiary">Try a different search term or filter</p>
    </div>
  );
}

/* ---------- Loading state ---------- */

function LoadingState() {
  return (
    <div className="space-y-3 px-5 pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/5 rounded" />
            <Skeleton className="h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Error state ---------- */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 dark:bg-danger-100 mb-3">
        <X className="h-5 w-5 text-danger-500" />
      </div>
      <p className="text-body font-medium text-text-primary mb-1">Search failed</p>
      <p className="text-caption text-text-tertiary mb-3">Something went wrong. Please try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent-600 px-4 py-1.5 text-caption font-medium text-white hover:bg-accent-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

/* ---------- Initial (no query) hint ---------- */

function InitialHint() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 mb-3">
        <Search className="h-5 w-5 text-text-tertiary" />
      </div>
      <p className="text-body font-medium text-text-primary mb-1">Search across Collabix</p>
      <p className="text-caption text-text-tertiary">Type to search projects, tasks, documents, and more</p>
    </div>
  );
}

/* ---------- Main SearchModal ---------- */

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const totalItems = results.reduce((s, g) => s + g.items.length, 0);

  /* ---------- Simulate search (placeholder) ---------- */

  const performSearch = useCallback(async (q: string) => {
    if (!normalize(q)) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const allItems = [
        ...mockGroups.flatMap((g) => g.items),
        ...allSettings,
      ];
      const matched = allItems.filter((item) => matches(item, q));
      const grouped: SearchGroup[] = [];
      const groupMap = new Map<SearchEntityType, SearchItem[]>();
      for (const item of matched) {
        if (!groupMap.has(item.type)) groupMap.set(item.type, []);
        groupMap.get(item.type)!.push(item);
      }
      const groupLabels: Record<SearchEntityType, string> = {
        project: 'Projects',
        task: 'Tasks',
        document: 'Documents',
        team: 'Teams',
        settings: 'Settings',
      };
      for (const [type, items] of groupMap) {
        grouped.push({ label: groupLabels[type], items });
      }
      setResults(grouped);
      setSelectedIndex(0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- Debounce query changes ---------- */

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter, performSearch]);

  /* ---------- Keyboard navigation ---------- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && totalItems > 0) {
        e.preventDefault();
        let idx = 0;
        for (const group of results) {
          for (const item of group.items) {
            if (idx === selectedIndex) {
              addRecent(query);
              onClose();
              navigate(item.url);
              return;
            }
            idx++;
          }
        }
      }
    },
    [totalItems, results, selectedIndex, query, navigate, onClose],
  );

  /* ---------- Select from recent ---------- */

  const handleRecentSelect = useCallback(
    (q: string) => {
      setQuery(q);
      inputRef.current?.focus();
    },
    [],
  );

  /* ---------- Select a result ---------- */

  const handleResultSelect = useCallback(
    (item: SearchItem) => {
      addRecent(query);
      onClose();
      navigate(item.url);
    },
    [query, navigate, onClose],
  );

  /* ---------- Reset when opening ---------- */

  useEffect(() => {
    if (open) {
      setQuery('');
      setFilter('all');
      setResults([]);
      setLoading(false);
      setError(false);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ---------- Filter results ---------- */

  const filtered = filter === 'all'
    ? results
    : results.filter((g) => g.items[0]?.type === filter);

  const filteredCount = filtered.reduce((s, g) => s + g.items.length, 0);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-text-primary/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative w-full max-w-xl mx-4 animate-scale-in"
      >
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-elevated shadow-cx-xl">
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3">
            <Search className="h-5 w-5 shrink-0 text-text-tertiary" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, tasks, documents..."
              className="min-w-0 flex-1 bg-transparent text-body text-text-primary placeholder:text-text-tertiary outline-none"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={!!query || filteredCount > 0}
              aria-haspopup="listbox"
              aria-controls="search-results"
              aria-activedescendant={selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="shrink-0 rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-2xs font-medium text-text-tertiary">
              ESC
            </kbd>
          </div>

          {/* Filters */}
          <FilterBar active={filter} onChange={setFilter} />

          {/* Content */}
          <div ref={listRef} id="search-results" role="listbox" className="max-h-80 overflow-y-auto">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState onRetry={() => performSearch(query)} />
            ) : query && filteredCount === 0 ? (
              <EmptyState query={query} />
            ) : query ? (
              <ResultGroups groups={filtered} selectedIndex={selectedIndex} onSelect={handleResultSelect} />
            ) : (
              <>
                <RecentSearches onSelect={handleRecentSelect} onClear={clearRecent} />
                <InitialHint />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border-subtle px-5 py-2.5">
            <div className="flex items-center gap-3 text-2xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border-subtle bg-surface-2 px-1 py-0.5 font-medium">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border-subtle bg-surface-2 px-1 py-0.5 font-medium">↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border-subtle bg-surface-2 px-1 py-0.5 font-medium">ESC</kbd>
                Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
              <Sparkles className="h-3 w-3 text-accent-500" />
              <span>Ask Collabix AI</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
