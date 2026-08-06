import { BookMarked, Clock, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../ui/IconButton';

interface PromptHeaderProps {
  searches: string[];
  onSearch: (query: string) => void;
}

export function PromptHeader({ searches, onSearch }: PromptHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            <h1 className="text-page font-semibold text-text-primary">Prompt Library</h1>
          </div>
          <p className="mt-0.5 text-caption text-text-tertiary">
            Discover reusable AI workflows designed to accelerate everyday business tasks.
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="Recently used" variant="ghost" size="sm" onClick={() => {}}>
            <Clock className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Favorites" variant="ghost" size="sm" onClick={() => {}}>
            <Star className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="History" variant="ghost" size="sm" onClick={() => navigate('/app/ai/conversations')}>
            <BookMarked className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
