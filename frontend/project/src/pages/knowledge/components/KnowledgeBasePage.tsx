import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  BookOpen,
  Flame,
  Star,
  Clock,
  Eye,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Zap,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { cn } from '../../../lib/cn';
import { useToast } from '../../../components/ui/Toast';
import { useKnowledgeList } from '../../../services/knowledge-hooks';

function mapArticle(article: any) {
  return {
    id: article.id,
    title: article.title,
    description: article.summary ?? article.content?.slice(0, 150) ?? '',
    category: article.category ?? 'general',
    slug: article.id,
    status: article.status?.toLowerCase() ?? 'published',
    difficulty: 'beginner',
    views: article.viewCount ?? 0,
    likes: article.favoriteCount ?? 0,
    readTime: Math.max(1, Math.ceil((article.content?.length ?? 0) / 1000)),
    updatedAt: article.updatedAt ?? article.createdAt,
    author: {
      name: article.createdBy ?? 'Unknown',
      tone: 0,
    },
  };
}

const recentActivity: { id: string; article: string; author: string; type: string; timestamp: string }[] = [];

export function KnowledgeBasePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('ws') ?? '';
  const departmentId = searchParams.get('dept') ?? '';
  const projectId = searchParams.get('proj') ?? '';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { toast } = useToast();
  const { data: kbData, isLoading, isError } = useKnowledgeList(workspaceId, departmentId, projectId);

  const knowledgeArticles = useMemo(() => {
    if (!kbData?.content) return [];
    return kbData.content.map(mapArticle);
  }, [kbData]);

  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    knowledgeArticles.forEach((a) => {
      catMap.set(a.category, (catMap.get(a.category) ?? 0) + 1);
    });
    return Array.from(catMap.entries()).map(([name, count], idx) => ({
      id: `cat-${idx}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug: name,
      articleCount: count,
      icon: getCategoryIcon(name),
      color: getCategoryColor(idx),
    }));
  }, [knowledgeArticles]);

  const filteredArticles = knowledgeArticles.filter((article) => {
    const matchesSearch = search === '' || 
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recentlyUpdated = [...knowledgeArticles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const mostViewed = [...knowledgeArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  const pinnedArticles = knowledgeArticles.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-body font-medium text-danger-600">Failed to load knowledge base</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Knowledge Base</h1>
        <p className="text-body text-text-secondary">
          Explore guides, documentation, and best practices for Collabix.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search articles, guides, and FAQs..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full"
          />
        </div>
        <Button onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Advanced Search</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatWidget
          icon={<BookOpen />}
          label="Total Articles"
          value={knowledgeArticles.length}
        />
        <StatWidget
          icon={<Eye />}
          label="Total Views"
          value={knowledgeArticles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
        />
        <StatWidget
          icon={<Star />}
          label="Total Likes"
          value={knowledgeArticles.reduce((sum, a) => sum + a.likes, 0).toLocaleString()}
        />
        <StatWidget
          icon={<Zap />}
          label="Categories"
          value={categories.length}
        />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section font-semibold text-text-primary">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all',
                selectedCategory === category.slug
                  ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-100`
                  : 'border-border-subtle bg-surface hover:border-border-default',
              )}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="text-body font-semibold text-text-primary mb-1">{category.name}</h3>
              <p className="text-caption text-text-tertiary">
                {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recently Updated */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recently Updated
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {recentlyUpdated.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate(`/app/knowledge/${article.id}`)}
                className="block w-full text-left p-2 rounded hover:bg-surface-2 transition-colors group"
              >
                <p className="text-body font-medium text-text-primary group-hover:text-accent-600 line-clamp-2">
                  {article.title}
                </p>
                <p className="text-caption text-text-tertiary mt-1">{article.updatedAt}</p>
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Most Viewed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Viewed
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {mostViewed.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate(`/app/knowledge/${article.id}`)}
                className="block w-full text-left p-2 rounded hover:bg-surface-2 transition-colors group"
              >
                <p className="text-body font-medium text-text-primary group-hover:text-accent-600 line-clamp-2">
                  {article.title}
                </p>
                <p className="text-caption text-text-tertiary mt-1">
                  {article.views.toLocaleString()} views
                </p>
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => {
              const article = knowledgeArticles.find((a) => a.id === activity.article);
              return (
                <div key={activity.id} className="py-2 border-b border-border-subtle last:border-0">
                  <p className="text-caption font-medium text-text-primary">
                    <span className="text-text-secondary">{activity.author}</span> {activity.type === 'published' ? '📤' : activity.type === 'updated' ? '✏️' : '📝'} {activity.type === 'published' ? 'published' : activity.type === 'updated' ? 'updated' : 'created'}
                  </p>
                  <p className="text-2xs text-text-tertiary mt-1 line-clamp-1">
                    "{article?.title}"
                  </p>
                  <p className="text-2xs text-text-tertiary">{activity.timestamp}</p>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Featured Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section font-semibold text-text-primary">Pinned Articles</h2>
          <Button variant="ghost" rightIcon={<ChevronRight />}>
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pinnedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* All Articles */}
      {search || selectedCategory ? (
        <div>
          <h2 className="text-section font-semibold text-text-primary mb-4">
            Search Results ({filteredArticles.length})
          </h2>
          <div className="space-y-2">
            {filteredArticles.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getCategoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    guide: '📖',
    tutorial: '🎓',
    reference: '📚',
    faq: '❓',
    'how-to': '🔧',
    'best-practice': '⭐',
  };
  return icons[cat] ?? '📄';
}

function getCategoryColor(idx: number): string {
  const colors = ['accent', 'info', 'success', 'warning', 'danger'];
  return colors[idx % colors.length];
}

function StatWidget({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-tertiary [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <p className="text-2xs text-text-tertiary">{label}</p>
      </div>
      <p className="text-section font-bold text-text-primary">{value}</p>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  const navigate = useNavigate();
  const categoryColors = {
    guide: 'accent',
    tutorial: 'info',
    reference: 'neutral',
    faq: 'success',
    'how-to': 'info',
    'best-practice': 'success',
  } as const;

  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const;

  return (
    <Card className="hover:border-border-default hover:shadow-lg transition-all flex flex-col h-full">
      <CardBody className="flex-1 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge tone={categoryColors[article.category]} variant="soft">
              {article.category}
            </Badge>
            <Badge tone={difficultyColors[article.difficulty]} variant="soft">
              {article.difficulty}
            </Badge>
          </div>
          <h3 className="text-body font-semibold text-text-primary line-clamp-2">
            {article.title}
          </h3>
          <p className="text-caption text-text-secondary line-clamp-2 mt-2">
            {article.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-2xs text-text-tertiary border-t border-border-subtle pt-3">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.views.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {article.likes}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}m read
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
          <Avatar name={article.author.name} tone={article.author.tone} />
          <div className="flex-1 min-w-0">
            <p className="text-2xs font-medium text-text-primary truncate">
              {article.author.name}
            </p>
          </div>
        </div>

        <Button variant="outline" fullWidth rightIcon={<ArrowRight />} onClick={() => navigate(`/app/knowledge/${article.id}`)}>
          Read Article
        </Button>
      </CardBody>
    </Card>
  );
}

function ArticleListItem({ article }: { article: any }) {
  const navigate = useNavigate();
  const categoryColors = {
    guide: 'accent',
    tutorial: 'info',
    reference: 'neutral',
    faq: 'success',
    'how-to': 'info',
    'best-practice': 'success',
  } as const;

  return (
    <button
      onClick={() => navigate(`/app/knowledge/${article.id}`)}
      className="flex w-full text-left items-start gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 hover:border-border-default transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-body font-medium text-text-primary hover:text-accent-600">
            {article.title}
          </h3>
          <Badge tone={categoryColors[article.category]} variant="soft">
            {article.category}
          </Badge>
        </div>
        <p className="text-caption text-text-secondary line-clamp-1">
          {article.description}
        </p>
      </div>

      <div className="flex items-center gap-2 text-2xs text-text-tertiary shrink-0">
        <div className="text-center">
          <p className="font-medium text-text-primary">{article.views.toLocaleString()}</p>
          <p>views</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-text-primary">{article.readTime}m</p>
          <p>read</p>
        </div>
      </div>
    </button>
  );
}
