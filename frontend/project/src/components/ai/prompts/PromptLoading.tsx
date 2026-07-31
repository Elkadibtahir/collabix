import { cn } from '../../../lib/cn';

function Block({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-border-subtle to-surface-2 bg-[length:200%_100%]', className)} />;
}

export function PromptLoading() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <Block className="h-6 w-64" />
        <Block className="h-4 w-96" />
      </div>

      <Block className="h-14 w-full rounded-xl" />

      <div className="flex gap-2">
        <Block className="h-9 w-28 rounded-full" />
        <Block className="h-9 w-24 rounded-full" />
        <Block className="h-9 w-20 rounded-full" />
        <Block className="h-9 w-32 rounded-full" />
        <Block className="h-9 w-28 rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        <Block className="h-5 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-border-subtle bg-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <Block className="h-5 w-16 rounded-md" />
                <Block className="h-7 w-7 rounded-md" />
              </div>
              <Block className="h-5 w-4/5 mb-2" />
              <Block className="h-4 w-full mb-1" />
              <Block className="h-4 w-3/4 mb-4" />
              <div className="flex gap-1.5 mb-4">
                <Block className="h-5 w-14 rounded-md" />
                <Block className="h-5 w-16 rounded-md" />
              </div>
              <div className="pt-3 border-t border-border-subtle flex justify-between">
                <Block className="h-4 w-20" />
                <Block className="h-7 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Block className="h-5 w-32" />
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="shrink-0 w-64 rounded-xl border border-border-subtle bg-elevated p-4">
              <Block className="h-4 w-4/5 mb-2" />
              <Block className="h-3 w-16 mb-3" />
              <div className="flex gap-2">
                <Block className="h-7 w-16 rounded-lg" />
                <Block className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
