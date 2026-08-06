
interface ActivityTimelineProps {
  children: React.ReactNode;
}

export function ActivityTimeline({ children }: ActivityTimelineProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

interface ActivityTimelineGroupProps {
  label: string;
  children: React.ReactNode;
}

export function ActivityTimelineGroup({ label, children }: ActivityTimelineGroupProps) {
  return (
    <div className="relative pb-8">
      <div className="sticky top-0 z-10 bg-canvas pb-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border-subtle" />
          <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider">{label}</p>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
