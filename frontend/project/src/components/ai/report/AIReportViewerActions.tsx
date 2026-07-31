import { Download, Copy, Printer, Share2, Heart, RefreshCw, MessageSquare, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/cn';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';

interface AIReportViewerActionsProps {
  favorite: boolean;
  onToggleFavorite: () => void;
}

export function AIReportViewerActions({ favorite, onToggleFavorite }: AIReportViewerActionsProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="sticky bottom-0 z-10 rounded-xl border border-border-subtle bg-elevated dark:bg-surface shadow-cx-lg p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="primary" leftIcon={<Download />}>Export PDF</Button>
          <IconButton size="sm" label={copied ? 'Copied' : 'Copy'} variant="ghost" onClick={handleCopy}>
            <Copy className={cn('h-4 w-4', copied && 'text-success-500')} />
          </IconButton>
          <IconButton size="sm" label="Print" variant="ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </IconButton>
          <IconButton size="sm" label="Share" variant="ghost" onClick={() => {}}>
            <Share2 className="h-4 w-4" />
          </IconButton>
          <IconButton size="sm" label="Download" variant="ghost" onClick={() => {}}>
            <Download className="h-4 w-4" />
          </IconButton>
          <IconButton size="sm" label={favorite ? 'Remove from favorites' : 'Add to favorites'} variant="ghost" onClick={onToggleFavorite}>
            <Heart className={cn('h-4 w-4', favorite && 'fill-danger-500 text-danger-500')} />
          </IconButton>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" leftIcon={<RefreshCw />}>Regenerate</Button>
          <Button size="sm" variant="secondary" leftIcon={<MessageSquare />}>Continue</Button>
          <Button size="sm" variant="ghost" leftIcon={<FileText />}>Source Data</Button>
        </div>
      </div>
    </div>
  );
}
