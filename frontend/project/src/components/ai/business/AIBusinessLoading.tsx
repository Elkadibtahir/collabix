import { cn } from '../../../lib/cn';

function Block({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-border-subtle to-surface-2 bg-[length:200%_100%]', className)} />;
}

export function AIBusinessLoading() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Block className="h-9 w-9 rounded-xl" />
        <div className="space-y-1">
          <Block className="h-5 w-48" />
          <Block className="h-3 w-72" />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="rounded-xl border border-border-subtle p-5 space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <Block className="h-3 w-20 mb-1.5" />
                <Block className="h-9 w-full rounded-lg" />
              </div>
            ))}
            <Block className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <Block className="h-6 w-64" />
          <div className="rounded-xl border border-border-subtle p-5 space-y-4">
            <Block className="h-4 w-3/4" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <div className="space-y-2 pt-2">
              <Block className="h-4 w-2/3" />
              <Block className="h-4 w-3/4" />
              <Block className="h-4 w-1/2" />
            </div>
          </div>
          <Block className="h-6 w-48" />
          <div className="flex gap-2">
            <Block className="h-9 w-36 rounded-lg" />
            <Block className="h-9 w-28 rounded-lg" />
            <Block className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
