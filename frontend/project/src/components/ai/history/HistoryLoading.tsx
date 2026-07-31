import { cn } from '../../../lib/cn';

function Block({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-border-subtle to-surface-2 bg-[length:200%_100%]', className)} />;
}

export function HistoryLoading() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <Block className="h-6 w-48" />
        <Block className="h-4 w-96" />
      </div>

      <Block className="h-14 w-full rounded-xl" />

      <div className="flex gap-2">
        <Block className="h-9 w-24 rounded-full" />
        <Block className="h-9 w-28 rounded-full" />
        <Block className="h-9 w-20 rounded-full" />
        <Block className="h-9 w-24 rounded-full" />
      </div>

      <div className="space-y-8">
        {['Today', 'Yesterday', 'Last 7 Days'].map((label) => (
          <div key={label}>
            <div className="flex items-center gap-3 mb-4">
              <Block className="h-7 w-7 rounded-lg" />
              <Block className="h-4 w-24" />
              <Block className="flex-1 h-px" />
            </div>
            <div className="space-y-3 ml-10">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-border-subtle bg-elevated p-5">
                  <div className="flex gap-4">
                    <Block className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Block className="h-5 w-48" />
                        <Block className="h-5 w-20 rounded-md" />
                      </div>
                      <Block className="h-4 w-full" />
                      <Block className="h-4 w-3/4" />
                      <div className="flex gap-3 mt-2">
                        <Block className="h-3 w-28" />
                        <Block className="h-3 w-20" />
                        <Block className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
