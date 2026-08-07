import { useState, type ReactNode } from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumbs, type BreadcrumbItem } from '../ui/Breadcrumbs';

export interface AppShellProps {
  activeNav: string;
  onNavigate: (id: string) => void;
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
}

export function AppShell({ activeNav, onNavigate, breadcrumbs, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:inset-x-4 focus:top-4 focus:flex focus:h-12 focus:items-center focus:justify-center focus:rounded-xl focus:bg-accent-600 focus:px-4 focus:text-body focus:font-semibold focus:text-white focus:shadow-cx-lg"
      >
        Skip to main content
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        activeId={activeNav}
        onNavigate={onNavigate}
      />
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeId={activeNav}
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          breadcrumbs={<Breadcrumbs items={breadcrumbs} />}
        />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div key={activeNav} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
