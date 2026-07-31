import type { ReactNode } from 'react';

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="cx-card rounded-2xl px-6 py-8 sm:px-10 sm:py-10 shadow-cx-lg">
      {children}
    </div>
  );
}
