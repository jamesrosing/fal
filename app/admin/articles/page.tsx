'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Loader2, Trash2, Archive, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Article, ArticleCategory } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function ArticlesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([loadArticles(), loadCategories()]).finally(() => setLoading(false));
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);
      console.log('Fetching articles...');

      const response = await fetch('/api/articles', {
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      // Try to parse response as JSON even if content-type is wrong
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to load articles';
        console.error('API Error:', data);
        throw new Error(errorMessage);
      }

      if (!Array.isArray(data)) {
        console.error('Expected array of articles but got:', data);
        throw new Error('Invalid response format from server');
      }

      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load articles',
        variant: 'destructive',
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredArticles.map(article => article.id)));
    }
  };

  const handleSelectArticle = (id: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedArticles(newSelected);
  };

  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedArticles.size === 0) return;

    const confirmMessage = {
      publish: 'Are you sure you want to publish the selected articles?',
      archive: 'Are you sure you want to archive the selected articles?',
      delete: 'Are you sure you want to delete the selected articles? This action cannot be undone.',
    }[action];

    if (!confirm(confirmMessage)) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/articles/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedArticles),
        }),
      });

      if (!response.ok) throw new Error('Failed to process bulk action');

      toast({
        title: 'Success',
        description: `Successfully ${action}ed selected articles`,
      });

      // Reload articles and clear selection
      await loadArticles();
      setSelectedArticles(new Set());
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action} articles`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-zinc-500">Manage your blog articles and content</p>
        </div>
        <Button onClick={() => router.push('/admin/articles/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('published')}>Published</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Drafts</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('archived')}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Category
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions */}
      {selectedArticles.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedArticles.size} article{selectedArticles.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('publish')}
            disabled={processing}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('archive')}
            disabled={processing}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            disabled={processing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-card rounded-lg">
          <Checkbox
            checked={selectedArticles.size === filteredArticles.length}
            onCheckedChange={handleSelectAll}
          />
          <div className="ml-4 flex-1">Title</div>
          <div className="w-32">Status</div>
          <div className="w-32">Category</div>
          <div className="w-32">Date</div>
          <div className="w-8" />
        </div>

        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-4 bg-card rounded-lg"
          >
            <Checkbox
              checked={selectedArticles.has(article.id)}
              onCheckedChange={() => handleSelectArticle(article.id)}
            />
            <div className="ml-4 flex-1">
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-1">{article.excerpt}</p>
            </div>
            <div className="w-32">
              <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                {article.status}
              </Badge>
            </div>
            <div className="w-32">
              <Badge variant="outline">
                {categories.find(c => c.id === article.category_id)?.name || 'Uncategorized'}
              </Badge>
            </div>
            <div className="w-32 text-sm text-zinc-500">
              {format(new Date(article.created_at), 'MMM d, yyyy')}
            </div>
            <div className="w-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/admin/articles/${article.id}/edit`)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/admin/articles/${article.id}/preview`)}>
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/articles/${article.id}/ai-enhance`)}
                    className="text-blue-500"
                  >
                    AI Enhance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('archive')}
                    className="text-red-500"
                  >
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 