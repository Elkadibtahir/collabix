import { ShieldCheck } from 'lucide-react';

export function AuthFooter() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-2xs text-text-tertiary">
      <ShieldCheck className="h-3.5 w-3.5" />
      Protected by enterprise-grade authentication and secure encrypted connections.
    </div>
  );
}
