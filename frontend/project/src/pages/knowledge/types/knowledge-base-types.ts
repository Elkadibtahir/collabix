export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleCategory = 'guide' | 'tutorial' | 'reference' | 'faq' | 'how-to' | 'best-practice' | 'troubleshooting';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Author {
  id: string;
  name: string;
  email: string;
  tone: number;
  avatar?: string;
  role: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: ArticleCategory;
  subcategory?: string;
  status: ArticleStatus;
  author: Author;
  contributors: Author[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags: string[];
  views: number;
  likes: number;
  difficulty: Difficulty;
  readTime: number;
  relatedArticles: string[];
  hasBreadcrumbs: boolean;
  hasTableOfContents: boolean;
  hasImages: boolean;
  hasCodeBlocks: boolean;
  hasWarnings: boolean;
  hasTips: boolean;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
  isPopular: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'created' | 'updated' | 'published' | 'commented';
  article: string;
  author: string;
  timestamp: string;
  description: string;
}
