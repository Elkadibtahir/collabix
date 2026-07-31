import { useState, type ReactNode } from 'react';
import { Check, Globe, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AuthLayoutProps {
  children: ReactNode;
}

const features = [
  'Secure Workspace',
  'Department Collaboration',
  'AI-powered Productivity',
  'Knowledge Management',
  'Enterprise Security',
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-600 text-white shadow-cx-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </div>
      <div>
        <p className="text-page font-bold text-text-primary leading-none tracking-tight">Collabix</p>
        <p className="text-2xs text-text-tertiary mt-1">Enterprise Workspace</p>
      </div>
    </div>
  );
}

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(languages[0]);

  return (
    <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Language: ${current.label}`}
          className="inline-flex items-center gap-1.5 text-2xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
        <Globe className="h-3.5 w-3.5" />
        {current.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="listbox" aria-label="Select language" className="absolute bottom-6 right-0 z-20 w-36 rounded-lg border border-border-subtle bg-elevated shadow-cx-lg py-1 animate-scale-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={lang.code === current.code}
                onClick={() => { setCurrent(lang); setOpen(false); }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5 text-2xs transition-colors',
                  lang.code === current.code ? 'text-accent-600 dark:text-accent-300 font-medium' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                {lang.label}
                {lang.code === current.code && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 px-6 py-5 border-t border-border-subtle bg-canvas sm:flex-row sm:justify-between">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <a href="#" className="text-2xs text-text-tertiary hover:text-text-secondary transition-colors">Privacy Policy</a>
        <a href="#" className="text-2xs text-text-tertiary hover:text-text-secondary transition-colors">Terms of Service</a>
        <a href="#" className="text-2xs text-text-tertiary hover:text-text-secondary transition-colors">Help Center</a>
      </div>
      <div className="flex items-center gap-5">
        <LanguageSelector />
        <span className="text-2xs text-text-tertiary">v1.0.0</span>
      </div>
    </footer>
  );
}

function EnterpriseIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto" role="none">
      <svg viewBox="0 0 400 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Soft background blobs */}
        <circle cx="200" cy="160" r="150" fill="rgb(var(--accent-50))" opacity="0.6" />
        <circle cx="320" cy="80" r="60" fill="rgb(var(--accent-100))" opacity="0.4" />
        <circle cx="80" cy="240" r="50" fill="rgb(var(--accent-100))" opacity="0.35" />

        {/* Central workspace card */}
        <rect x="130" y="110" width="140" height="100" rx="14" fill="rgb(var(--bg-elevated))" stroke="rgb(var(--accent-200))" strokeWidth="1.5" />
        <rect x="146" y="126" width="60" height="8" rx="4" fill="rgb(var(--accent-500))" />
        <rect x="146" y="142" width="108" height="5" rx="2.5" fill="rgb(var(--border-default))" />
        <rect x="146" y="154" width="90" height="5" rx="2.5" fill="rgb(var(--border-default))" />
        <rect x="146" y="172" width="40" height="22" rx="6" fill="rgb(var(--accent-600))" />
        <rect x="194" y="172" width="60" height="22" rx="6" fill="rgb(var(--accent-100))" />

        {/* Orbiting department nodes */}
        <g>
          {/* Top-left node */}
          <circle cx="70" cy="90" r="28" fill="rgb(var(--bg-elevated))" stroke="rgb(var(--accent-300))" strokeWidth="1.5" />
          <rect x="56" y="82" width="28" height="5" rx="2.5" fill="rgb(var(--accent-500))" />
          <rect x="56" y="92" width="20" height="4" rx="2" fill="rgb(var(--border-default))" />
          <line x1="98" y1="98" x2="130" y2="120" stroke="rgb(var(--accent-200))" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Top-right node */}
          <circle cx="330" cy="90" r="28" fill="rgb(var(--bg-elevated))" stroke="rgb(var(--accent-300))" strokeWidth="1.5" />
          <rect x="316" y="82" width="28" height="5" rx="2.5" fill="rgb(var(--accent-500))" />
          <rect x="316" y="92" width="20" height="4" rx="2" fill="rgb(var(--border-default))" />
          <line x1="302" y1="98" x2="270" y2="120" stroke="rgb(var(--accent-200))" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Bottom-left node */}
          <circle cx="70" cy="230" r="28" fill="rgb(var(--bg-elevated))" stroke="rgb(var(--accent-300))" strokeWidth="1.5" />
          <rect x="56" y="222" width="28" height="5" rx="2.5" fill="rgb(var(--accent-500))" />
          <rect x="56" y="232" width="20" height="4" rx="2" fill="rgb(var(--border-default))" />
          <line x1="98" y1="222" x2="130" y2="200" stroke="rgb(var(--accent-200))" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Bottom-right node */}
          <circle cx="330" cy="230" r="28" fill="rgb(var(--bg-elevated))" stroke="rgb(var(--accent-300))" strokeWidth="1.5" />
          <rect x="316" y="222" width="28" height="5" rx="2.5" fill="rgb(var(--accent-500))" />
          <rect x="316" y="232" width="20" height="4" rx="2" fill="rgb(var(--border-default))" />
          <line x1="302" y1="222" x2="270" y2="200" stroke="rgb(var(--accent-200))" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>

        {/* Floating collaboration indicators */}
        <g>
          <circle cx="200" cy="60" r="14" fill="rgb(var(--accent-600))" />
          <path d="M194 60 L199 65 L207 56" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <circle cx="200" cy="260" r="14" fill="rgb(var(--success-500))" />
          <path d="M195 260 L199 264 L206 256" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* LEFT SIDE — branding & illustration (hidden on mobile) */}
        <div className="relative hidden lg:flex lg:w-[48%] xl:w-[46%] flex-col justify-between overflow-hidden bg-surface px-12 py-10 xl:px-16">
          {/* Subtle geometric pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgb(var(--text-primary)) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Soft accent glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-100/40 blur-3xl dark:bg-accent-100/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-50 blur-3xl dark:bg-accent-100/5" />

          <div className="relative z-10 animate-fade-in">
            <Logo />
          </div>

          <div className="relative z-10 flex flex-col gap-8 animate-slide-up">
            <div>
              <h1 className="text-display xl:text-hero font-bold text-text-primary leading-tight tracking-tight max-w-md">
                One workspace.
                <br />
                Every team.
                <br />
                <span className="text-accent-600 dark:text-accent-400">Total collaboration.</span>
              </h1>
              <p className="mt-4 max-w-sm text-body-lg text-text-secondary leading-relaxed">
                The enterprise platform where departments, teams, and projects align — built for secure, AI-powered productivity at scale.
              </p>
            </div>

            <EnterpriseIllustration />

            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 max-w-md">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-body text-text-secondary">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-white shrink-0">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-2xs text-text-tertiary animate-fade-in">
            <ShieldCheck className="h-3.5 w-3.5" />
            SOC 2 Type II · ISO 27001 · GDPR Compliant
          </div>
        </div>

        {/* RIGHT SIDE — authentication card */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
            <div className="w-full max-w-[460px] animate-slide-up">
              {/* Mobile logo (visible only on small screens) */}
              <div className="mb-8 flex justify-center lg:hidden">
                <Logo />
              </div>
              <div className="cx-card rounded-2xl px-6 py-8 sm:px-10 sm:py-10 shadow-cx-lg">
                {children}
              </div>
              <p className="mt-6 text-center text-2xs text-text-tertiary">
                Need help? <a href="#" className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors">Contact your administrator</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
