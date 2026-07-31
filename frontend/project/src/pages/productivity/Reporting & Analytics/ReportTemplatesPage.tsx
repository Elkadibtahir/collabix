import { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Eye,
  Plus,
  Search,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { reportTemplates } from './reports-data';

export function ReportTemplatesPage({ onBack, onUseTemplate }: { onBack?: () => void; onUseTemplate?: (templateId: string) => void }) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>();
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(reportTemplates.filter((t) => t.isFavorite).map((t) => t.id)),
  );

  const filteredTemplates = reportTemplates.filter((template) => {
    const matchesSearch =
      search === '' ||
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = Array.from(new Set(reportTemplates.map((t) => t.type)));

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-page font-semibold text-text-primary">Report Templates</h1>
          <p className="text-body text-text-secondary">
            Choose from ready-made templates or create a custom report.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="outline">
              Type
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'All Types', onClick: () => setSelectedType(undefined) },
            { divider: true },
            ...types.map((t) => ({
              label: t.charAt(0).toUpperCase() + t.slice(1),
              onClick: () => setSelectedType(t),
            })),
          ]}
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={<Filter />}
          title="No templates found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={favorites.has(template.id)}
              onToggleFavorite={() => toggleFavorite(template.id)}
              onUse={() => onUseTemplate?.(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
  onUse,
}: {
  template: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onUse: () => void;
}) {
  const typeEmoji: Record<string, string> = {
    workspace: '🏢',
    department: '👥',
    team: '👨‍💼',
    project: '📋',
    productivity: '📊',
    knowledge: '📚',
    documents: '📄',
    activity: '🔄',
    handover: '📝',
    notification: '🔔',
  };

  return (
    <Card className="hover:border-border-default transition-colors flex flex-col h-full">
      {/* Preview Area */}
      <div className="h-40 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900 dark:to-accent-800 flex items-center justify-center border-b border-border-subtle">
        <span className="text-5xl">{typeEmoji[template.type]}</span>
      </div>

      <CardBody className="flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-semibold text-text-primary line-clamp-2">
              {template.name}
            </h3>
            <Badge tone="accent" variant="soft" className="mt-2">
              {template.type}
            </Badge>
          </div>
          <IconButton
            label="Favorite"
            variant="ghost"
           
            className={cn(
              'text-text-tertiary shrink-0',
              isFavorite && 'text-warning-600',
            )}
            onClick={onToggleFavorite}
          >
            <Star className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </IconButton>
        </div>

        {/* Description */}
        <p className="text-caption text-text-secondary line-clamp-2 flex-1">
          {template.description}
        </p>

        {/* Sections */}
        <div>
          <p className="text-2xs text-text-tertiary font-medium mb-2">Included Sections</p>
          <div className="flex flex-wrap gap-1">
            {template.includedSections.slice(0, 3).map((section: string) => (
              <Badge key={section} tone="info" variant="soft">
                {section}
              </Badge>
            ))}
            {template.includedSections.length > 3 && (
              <Badge tone="neutral" variant="soft">
                +{template.includedSections.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="text-center py-2 border-t border-border-subtle">
          <p className="text-2xs text-text-tertiary">
            Estimated generation: <span className="font-semibold text-text-primary">{template.estimatedTime}</span>
          </p>
          <p className="text-2xs text-text-tertiary mt-1">
            Used <span className="font-semibold text-text-primary">{template.usageCount}</span> times
          </p>
        </div>

        {/* Actions */}
        <Button fullWidth onClick={onUse} leftIcon={<Plus />}>
          Use Template
        </Button>
      </CardBody>
    </Card>
  );
}
