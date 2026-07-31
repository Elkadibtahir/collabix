import { cn } from '../../lib/cn';

function Block({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-border-subtle to-surface-2 bg-[length:200%_100%]', className)} />;
}

export function AILoadingHero() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-elevated p-8 sm:p-10">
      <Block className="h-4 w-32 mb-4" />
      <Block className="h-8 w-96 max-w-full mb-3" />
      <Block className="h-5 w-[500px] max-w-full mb-6" />
      <div className="flex gap-3">
        <Block className="h-11 w-44" />
        <Block className="h-11 w-48" />
      </div>
    </div>
  );
}

export function AILoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated p-5', className)}>
      <Block className="h-10 w-10 rounded-lg mb-4" />
      <Block className="h-4 w-3/5 mb-2" />
      <Block className="h-3 w-4/5" />
    </div>
  );
}

export function AILoadingStats({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-elevated p-4">
          <Block className="h-3 w-20 mb-3" />
          <Block className="h-6 w-16 mb-2" />
          <Block className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AILoadingTimeline() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-border-subtle last:border-0">
          <Block className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Block className="h-4 w-3/5" />
            <Block className="h-3 w-2/5" />
          </div>
          <Block className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AILoadingList() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0">
          <Block className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Block className="h-4 w-2/5" />
            <Block className="h-3 w-3/5" />
          </div>
          <Block className="h-3 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AILoadingSuggestions({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-elevated px-4 py-3">
          <Block className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}
