import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Command } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface HistorySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClearSearch: () => void;
  recentSearches: string[];
  trendSearches?: string[];
}

const DEFAULT_TRENDS = ['Budget forecast', 'Security audit', 'Handover notes'];

export function HistorySearch({ query, onQueryChange, onClearSearch, recentSearches: recent, trendSearches = DEFAULT_TRENDS }: HistorySearchProps) {
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleFocus() {
    setFocused(true);
    if (!query) setShowDropdown(true);
  }

  function handleSelect(item: string) {
    onQueryChange(item);
    setShowDropdown(false);
    inputRef.current?.blur();
  }

  const showRecent = focused && !query && showDropdown && (recent.length > 0 || trendSearches.length > 0);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-all',
          focused ? 'border-accent-500 ring-2 ring-accent-500/20 shadow-cx-sm' : 'border-border-subtle',
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          placeholder="Search conversations, reports or summaries..."
          aria-label="Search history"
          className="flex-1 bg-transparent text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Clear search"
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface-2 px-2 py-1 text-2xs text-text-tertiary">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </div>

      {showRecent && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border-subtle bg-elevated shadow-cx-lg animate-fade-in overflow-hidden">
          {recent.length > 0 && (
            <div className="p-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Recent searches</p>
              <div className="space-y-0.5">
                {recent.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors text-left"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {trendSearches.length > 0 && (
            <div className="border-t border-border-subtle p-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Trending searches</p>
              <div className="space-y-0.5">
                {trendSearches.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors text-left"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
