import { Heart, Clock, Building2, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { IconButton } from '../../ui/IconButton';

interface AIReportViewerHeaderProps {
  title: string;
  generatedDate: string;
  workspace: string;
  department: string;
  category: string;
  status: 'completed' | 'draft';
  favorite: boolean;
  onToggleFavorite: () => void;
}

export function AIReportViewerHeader({
  title,
  generatedDate,
  workspace,
  department,
  category,
  status,
  favorite,
  onToggleFavorite,
}: AIReportViewerHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-display font-bold text-text-primary tracking-tight">{title}</h1>
            <Badge variant="soft" tone={status === 'completed' ? 'success' : 'neutral'}>{status === 'completed' ? 'Completed' : 'Draft'}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-caption text-text-tertiary">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{generatedDate}</span>
            <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{workspace}</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{department}</span>
            <Badge variant="soft" tone="accent" className="text-2xs">{category}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label={favorite ? 'Remove from favorites' : 'Add to favorites'} variant="ghost" size="sm" onClick={onToggleFavorite}>
            <Heart className={cn('h-[18px] w-[18px]', favorite && 'fill-danger-500 text-danger-500')} />
          </IconButton>
          <IconButton label="View history" variant="ghost" size="sm" onClick={() => navigate('/app/ai/history')}>
            <Sparkles className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
