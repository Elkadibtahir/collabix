import { Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { IconButton } from '../../ui/IconButton';
import { moduleConfig, type AIModule } from './AIBusinessTypes';

interface AIBusinessHeaderProps {
  module: AIModule;
  title: string;
  description: string;
  className?: string;
}

export function AIBusinessHeader({ module, title, description, className }: AIBusinessHeaderProps) {
  const navigate = useNavigate();
  const cfg = moduleConfig[module];
  const Icon = cfg.icon;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', cfg.color)}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-page font-semibold text-text-primary">{title}</h1>
              <p className="mt-0.5 text-caption text-text-tertiary">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="Add to favorites" variant="ghost" size="sm" onClick={() => {}}>
            <Heart className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="View history" variant="ghost" size="sm" onClick={() => navigate('/app/ai/history')}>
            <Sparkles className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
