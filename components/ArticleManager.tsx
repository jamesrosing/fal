'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleCategory, ArticleContent } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import CloudinaryMediaLibrary from '@/components/CloudinaryMediaLibrary';
import { CloudinaryAsset } from '@/lib/cloudinary';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Edit2,
  Eye,
  FileText,
  Image,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Bot,
  X,
  FileImage,
  Wand2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

// Function to check if a date string is valid
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Main categories for articles
const MAIN_CATEGORIES = [
  "plastic-surgery",
  "dermatology", 
  "functional-medicine",
  "medical-spa",
  "trending-topics",
  "educational",
  "niche-focus"
];

// Add interface for subcategories
interface ArticleSubcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
}

interface ArticleManagerProps {
  initialCategoryId?: string;
}

export function ArticleManager({ initialCategoryId }: ArticleManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ArticleSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategoryId || 'all');
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article> | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerated, setAiGenerated] = useState<Partial<Article> | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<ArticleCategory> | null>(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState<Partial<ArticleSubcategory> | null>(null);
  const [isAiEnhancerDialogOpen, setIsAiEnhancerDialogOpen] = useState(false);
  const [enhancementFocus, setEnhancementFocus] = useState<'general' | 'seo' | 'engagement' | 'conversion' | 'images'>('general');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementPlan, setEnhancementPlan] = useState<any>(null);

  // Fetch articles and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchArticles(), fetchCategories()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load articles or categories',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fetch subcategories when active category changes
  useEffect(() => {
    if (activeCategoryId && activeCategoryId !== 'all') {
      fetchSubcategories(activeCategoryId);
    } else {
      setSubcategories([]);
      setActiveSubcategoryId('all');
    }
  }, [activeCategoryId]);

  // Fetch articles
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      // Filter to only include main categories
      const mainCategories = data.filter((cat: ArticleCategory) => 
        MAIN_CATEGORIES.includes(cat.slug)
      );
      
      setCategories(mainCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async (categoryId: string) => {
    try {
      setLoadingSubcategories(true);
      
      // Find the category by ID to get its slug
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        console.error('Category not found:', { categoryId, categories });
        return;
      }
      
      console.log('Fetching subcategories for:', { 
        categoryId, 
        categorySlug: category.slug, 
        categoryName: category.name 
      });
      
      const response = await fetch(`/api/articles/subcategories?category=${category.slug}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Subcategories fetched:', data);
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subcategories',
        variant: 'destructive',
      });
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Filter articles based on search query, category, subcategory, and status
  const filteredArticles = articles.filter(article => {
    try {
      // Skip articles with corrupted or invalid data
      if (!article || !article.title) {
        console.warn('Skipping article with missing title', article?.id);
        return false;
      }

      // Check if article matches the search query
      const matchesSearch = 
        searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check if article matches the selected category
      const matchesCategory = 
        activeCategoryId === 'all' || 
        article.category_id === activeCategoryId;
      
      // Check if article matches the selected subcategory
      const matchesSubcategory = 
        activeSubcategoryId === 'all' || 
        article.subcategory === activeSubcategoryId;
      
      // Check if article matches the selected status
      const matchesStatus = 
        statusFilter === 'all' || 
        article.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
    } catch (error) {
      console.error('Error filtering article:', error, article?.id);
      return false;
    }
  });

  // Generate article content with AI
  const generateArticleWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for AI generation',
        variant: 'destructive',
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/ai/article-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          category: activeCategoryId !== 'all' ? activeCategoryId : 'general',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAiGenerated(data.article);
      
      toast({
        title: 'Success',
        description: 'Article content generated successfully',
      });
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate article content',
        variant: 'destructive',
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // Apply AI generated content to the editor
  const applyAiContent = () => {
    if (aiGenerated) {
      setCurrentArticle(aiGenerated);
      setIsEditorOpen(true);
      setIsAiDialogOpen(false);
    }
  };

  // Create new article or update existing article
  const saveArticle = async (article: Partial<Article>) => {
    try {
      const url = article.id ? `/api/articles/${article.id}` : '/api/articles';
      const method = article.id ? 'PUT' : 'POST';
      
      // Make a copy of the article to modify
      const articleToSave = { ...article };
      
      // Ensure content is properly formatted
      if (articleToSave.content) {
        let validContent = [];
        
        // If content is a string, try to parse it or convert to paragraph
        if (typeof articleToSave.content === 'string') {
          try {
            const contentStr = articleToSave.content as string;
            if (contentStr.trim().startsWith('[')) {
              // Try to parse as JSON array
              const parsed = JSON.parse(contentStr);
              if (Array.isArray(parsed)) {
                validContent = parsed.map(block => {
                  // Ensure each block has correct structure
                  const validTypes = ['paragraph', 'heading', 'list', 'image', 'video', 'quote'];
                  return {
                    type: validTypes.includes(block.type) ? block.type : 'paragraph',
                    content: block.content || 'Content placeholder'
                  };
                });
              } else {
                // If parsed but not an array, create a paragraph
                validContent = [{ 
                  type: 'paragraph' as const, 
                  content: articleToSave.content 
                }];
              }
            } else {
              // Not JSON, create a paragraph
              validContent = [{ 
                type: 'paragraph' as const, 
                content: articleToSave.content 
              }];
            }
          } catch (e) {
            // If parsing fails, create a paragraph
            validContent = [{ 
              type: 'paragraph' as const, 
              content: articleToSave.content 
            }];
          }
        } 
        // If content is already an array, validate each item
        else if (Array.isArray(articleToSave.content)) {
          validContent = articleToSave.content.map(block => {
            // Ensure required properties exist on each block
            if (!block || typeof block !== 'object') {
              return {
                type: 'paragraph' as const,
                content: 'Content placeholder'
              };
            }
            
            // Ensure block has valid type
            const validTypes = ['paragraph', 'heading', 'list', 'image', 'video', 'quote'];
            const type = validTypes.includes(block.type) ? block.type : 'paragraph';
            
            // Ensure block has content (except for image/video types)
            let content = block.content;
            if ((type !== 'image' && type !== 'video') && (!content || typeof content !== 'string')) {
              content = 'Content placeholder';
            }
            
            return { 
              type: type as 'paragraph' | 'heading' | 'list' | 'image' | 'video' | 'quote', 
              content 
            };
          });
        } 
        // If content is some other type, convert to array with single paragraph
        else {
          validContent = [{ 
            type: 'paragraph' as const, 
            content: articleToSave.excerpt || 'Default article content' 
          }];
        }
        
        // Set the validated content
        articleToSave.content = validContent;
      } else {
        // If no content, initialize with empty array
        articleToSave.content = [];
      }
      
      // Log the article being saved for debugging
      console.log('Saving article with content structure:', 
        Array.isArray(articleToSave.content) ? 
          `Array with ${articleToSave.content.length} blocks` : 
          typeof articleToSave.content
      );
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleToSave),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error details:', errorData);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update local state
      if (article.id) {
        setArticles(prevArticles => 
          prevArticles.map(a => a.id === article.id ? data : a)
        );
        toast({
          title: 'Article updated',
          description: 'The article has been successfully updated',
        });
      } else {
        setArticles(prevArticles => [...prevArticles, data]);
        toast({
          title: 'Article created',
          description: 'The article has been successfully created',
        });
      }
      
      setIsEditorOpen(false);
      setCurrentArticle(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive',
      });
    }
  };

  // Delete article
  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update local state
      setArticles(prevArticles => prevArticles.filter(a => a.id !== id));
      
      toast({
        title: 'Article deleted',
        description: 'The article has been successfully deleted',
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedArticleId(null);
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    }
  };

  // Handle article image upload
  const handleImageUpload = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    const asset = Array.isArray(result) ? result[0] : result;
    setCurrentArticle(prev => prev ? { ...prev, featured_image: asset.publicId } : null);
  };

  // Create or update category
  const saveCategory = async (category: Partial<ArticleCategory>) => {
    try {
      const url = category.id ? '/api/articles/categories' : '/api/articles/categories';
      const method = category.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update local state
      if (category.id) {
        setCategories(prevCategories => 
          prevCategories.map(c => c.id === category.id ? data : c)
        );
        toast({
          title: 'Category updated',
          description: 'The category has been successfully updated',
        });
      } else {
        setCategories(prevCategories => [...prevCategories, data]);
        toast({
          title: 'Category created',
          description: 'The category has been successfully created',
        });
      }
      
      setIsCategoryDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      // Update local state
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      
      toast({
        title: 'Category deleted',
        description: 'The category has been successfully deleted',
      });
      
      setIsCategoryDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  // Create new article handler
  const handleCreateArticle = () => {
    setCurrentArticle({
      title: '',
      subtitle: '',
      excerpt: '',
      content: [],
      status: 'draft',
    });
    setIsCreating(true);
    setIsEditorOpen(true);
  };

  // Create new category handler
  const handleCreateCategory = () => {
    setCurrentCategory({
      name: '',
      slug: '',
      description: '',
    });
    setIsCategoryDialogOpen(true);
  };
  
  // Edit category handler
  const handleEditCategory = (category: ArticleCategory) => {
    setCurrentCategory({ ...category });
    setIsCategoryDialogOpen(true);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setActiveSubcategoryId('all'); // Reset subcategory filter when category changes
    
    // If we're in article edit mode, update the current article's category
    if (currentArticle) {
      setCurrentArticle({
        ...currentArticle,
        category_id: categoryId,
        subcategory: undefined // Clear subcategory when category changes
      });
    }
  };

  // Create new subcategory handler
  const handleCreateSubcategory = () => {
    // Default to the active category if one is selected
    const defaultCategoryId = activeCategoryId !== 'all' ? activeCategoryId : '';
    
    setCurrentSubcategory({
      name: '',
      slug: '',
      description: '',
      category_id: defaultCategoryId
    });
    setIsSubcategoryDialogOpen(true);
  };

  // Create or update subcategory
  const saveSubcategory = async (subcategory: Partial<ArticleSubcategory>) => {
    try {
      // Validate required fields
      if (!subcategory.name || !subcategory.category_id) {
        toast({
          title: 'Missing fields',
          description: 'Name and category are required',
          variant: 'destructive',
        });
        return;
      }
      
      const url = subcategory.id 
        ? `/api/articles/subcategories/${subcategory.id}` 
        : '/api/articles/subcategories';
      const method = subcategory.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subcategory),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update local state if we're in the same category
      if (subcategory.category_id === activeCategoryId) {
        if (subcategory.id) {
          setSubcategories(prev => prev.map(s => s.id === subcategory.id ? data : s));
        } else {
          setSubcategories(prev => [...prev, data]);
        }
      }
      
      toast({
        title: subcategory.id ? 'Subcategory updated' : 'Subcategory created',
        description: `The subcategory has been successfully ${subcategory.id ? 'updated' : 'created'}`,
      });
      
      setIsSubcategoryDialogOpen(false);
      setCurrentSubcategory(null);
      
      // Refresh subcategories if needed
      if (activeCategoryId && activeCategoryId !== 'all') {
        fetchSubcategories(activeCategoryId);
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subcategory',
        variant: 'destructive',
      });
    }
  };

  // Enhance article with AI
  const enhanceArticleWithAI = async () => {
    if (!currentArticle) {
      toast({
        title: 'Error',
        description: 'No article selected for enhancement',
        variant: 'destructive',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/ai/article-enhancer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          article: currentArticle,
          focus: enhancementFocus,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setEnhancementPlan(data.enhancementPlan);
      
      toast({
        title: 'Success',
        description: 'Article enhancement plan generated successfully',
      });
    } catch (error) {
      console.error('Error enhancing article:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate enhancement plan',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Apply enhancement
  const applyEnhancement = (field: string, value: any) => {
    if (!currentArticle || !enhancementPlan) return;
    
    let updatedArticle = { ...currentArticle };
    
    switch (field) {
      case 'title':
        updatedArticle.title = value;
        break;
      case 'subtitle':
        updatedArticle.subtitle = value;
        break;
      case 'meta_description':
        updatedArticle.meta_description = value;
        break;
      case 'meta_keywords':
        updatedArticle.meta_keywords = value;
        break;
      default:
        return;
    }
    
    setCurrentArticle(updatedArticle);
    
    toast({
      title: 'Enhancement Applied',
      description: `Applied enhancement to ${field}`,
    });
  };

  // Initial skeleton UI while loading
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Articles</h1>
            <p className="text-muted-foreground">
              Manage your blog articles and content
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsAiDialogOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateCategory}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
            <Button 
              variant="outline"
              onClick={handleCreateSubcategory}
              disabled={categories.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Subcategory
            </Button>
            <Button onClick={handleCreateArticle}>
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select 
              value={activeCategoryId} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={activeSubcategoryId} 
              onValueChange={setActiveSubcategoryId}
              disabled={activeCategoryId === 'all' || loadingSubcategories}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={loadingSubcategories ? "Loading..." : "Subcategory"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {loadingSubcategories ? (
                  <SelectItem value="loading" disabled>
                    <span className="flex items-center">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Loading...
                    </span>
                  </SelectItem>
                ) : subcategories.length > 0 ? (
                  subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.slug}>
                      {subcategory.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No subcategories found</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as 'all' | 'published' | 'draft' | 'archived')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Categories Filter Tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => {
          if (value === 'all') {
            setActiveCategoryId('all');
          } else {
            // Find the category ID for this slug
            const category = categories.find(cat => cat.slug === value);
            if (category) {
              setActiveCategoryId(category.id);
            }
          }
        }}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {MAIN_CATEGORIES.map(slug => {
              // Find the matching category to get its proper name
              const category = categories.find(cat => cat.slug === slug);
              if (!category) return null;
              
              return (
                <TabsTrigger key={slug} value={slug}>
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center border rounded-md bg-muted/10">
            <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || activeCategoryId !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by creating your first article.'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentArticle({
                  title: '',
                  subtitle: '',
                  excerpt: '',
                  content: [],
                  status: 'draft',
                  category_id: activeCategoryId !== 'all' ? activeCategoryId : '',
                });
                setIsCreating(true);
                setIsEditorOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Article
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => {
              try {
                const category = categories.find(c => c.id === article.category_id);
                
                return (
                  <Card key={article.id} className="overflow-hidden">
                    {article.featured_image ? (
                      <div className="relative h-48 w-full">
                        <CloudinaryImage
                          publicId={article.featured_image}
                          alt={article.title || 'Article image'}
                          className="object-cover h-full w-full"
                          fallbackSrc="/images/placeholder.jpg"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted h-48 flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          {category && (
                            <Badge variant="outline" className="mb-2">{category.name}</Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setCurrentArticle(article);
                              setIsCreating(false);
                              setIsEditorOpen(true);
                            }}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                try {
                                  if (article.slug) {
                                    router.push(`/articles/${article.slug}`);
                                  } else {
                                    toast({
                                      title: 'Error',
                                      description: 'This article has no slug and cannot be viewed',
                                      variant: 'destructive',
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error navigating to article:', error);
                                  toast({
                                    title: 'Error',
                                    description: 'Could not navigate to article',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                // Reset article data
                                const fixedArticle = { ...article };
                                // Ensure content is properly formatted
                                if (!fixedArticle.content || (Array.isArray(fixedArticle.content) && fixedArticle.content.length === 0)) {
                                  fixedArticle.content = [{
                                    type: 'paragraph' as const,
                                    content: fixedArticle.excerpt || 'Article content here'
                                  }];
                                }
                                setCurrentArticle(fixedArticle);
                                setIsCreating(false);
                                setIsEditorOpen(true);
                                toast({
                                  title: 'Article data refreshed',
                                  description: 'The article data has been reset to a stable state',
                                });
                              }}
                            >
                              <Loader2 className="mr-2 h-4 w-4" />
                              <span>Repair</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedArticleId(article.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setCurrentArticle(article);
                                setIsAiEnhancerDialogOpen(true);
                              }}
                            >
                              <Wand2 className="mr-2 h-4 w-4" />
                              <span>AI Enhance</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="line-clamp-2">{article.title || 'Untitled Article'}</CardTitle>
                      {article.subtitle && (
                        <CardDescription className="line-clamp-1">{article.subtitle}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm line-clamp-3">
                        {article.excerpt || 'No excerpt available'}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          article.status === 'published' ? 'bg-green-500' : 
                          article.status === 'draft' ? 'bg-amber-500' : 'bg-gray-500'
                        }`} />
                        <span className="capitalize">{article.status || 'unknown'}</span>
                      </div>
                      <div>
                        {article.created_at && isValidDate(article.created_at) 
                          ? format(new Date(article.created_at), 'MMM d, yyyy')
                          : 'No date'}
                      </div>
                    </CardFooter>
                  </Card>
                );
              } catch (error) {
                console.error('Error rendering article card:', error, article?.id);
                return (
                  <Card key={article.id || 'error-card'} className="overflow-hidden border-red-200">
                    <div className="bg-red-50 h-48 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2 text-red-500">Error</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                // Create a clean version of the article
                                const cleanArticle = {
                                  id: article.id,
                                  title: article.title || 'Problematic Article',
                                  excerpt: article.excerpt || '',
                                  content: [{
                                    type: 'paragraph' as const,
                                    content: article.excerpt || 'Article content here'
                                  }],
                                  status: article.status || 'draft',
                                  category_id: article.category_id || '',
                                };
                                setCurrentArticle(cleanArticle);
                                setIsCreating(false);
                                setIsEditorOpen(true);
                              }}
                            >
                              <Loader2 className="mr-2 h-4 w-4" />
                              <span>Repair</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedArticleId(article.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="line-clamp-2">
                        {article.title || 'Problematic Article'}
                      </CardTitle>
                      <CardDescription className="text-red-500">
                        This article has rendering issues and needs repair
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Create a clean version of the article
                          const cleanArticle = {
                            id: article.id,
                            title: article.title || 'Problematic Article',
                            excerpt: article.excerpt || '',
                            content: [{
                              type: 'paragraph' as const,
                              content: article.excerpt || 'Article content here'
                            }],
                            status: article.status || 'draft',
                            category_id: article.category_id || '',
                          };
                          setCurrentArticle(cleanArticle);
                          setIsCreating(false);
                          setIsEditorOpen(true);
                        }}
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                        Repair Article
                      </Button>
                    </CardFooter>
                  </Card>
                );
              }
            })}
          </div>
        )}

        {/* Article Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Create New Article' : 'Edit Article'}
              </DialogTitle>
              <DialogDescription>
                {isCreating 
                  ? 'Create a new article to publish on your site.' 
                  : 'Make changes to the existing article.'}
              </DialogDescription>
            </DialogHeader>

            {currentArticle && (
              <div className="space-y-6 py-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentArticle.title || ''}
                      onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                      placeholder="Enter article title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={currentArticle.subtitle || ''}
                      onChange={(e) => setCurrentArticle({ ...currentArticle, subtitle: e.target.value })}
                      placeholder="Enter article subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={currentArticle.excerpt || ''}
                      onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                      placeholder="Brief summary of the article"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={currentArticle.category_id || ''}
                        onValueChange={(value) => {
                          const updatedArticle = { ...currentArticle, category_id: value, subcategory: undefined };
                          setCurrentArticle(updatedArticle);
                          
                          // Fetch subcategories for the selected category
                          if (value) {
                            fetchSubcategories(value);
                          } else {
                            setSubcategories([]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        value={currentArticle.subcategory || 'none'}
                        onValueChange={(value) => setCurrentArticle({ ...currentArticle, subcategory: value === 'none' ? undefined : value })}
                        disabled={!currentArticle.category_id || loadingSubcategories}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {subcategories.length > 0 ? (
                            subcategories.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.slug}>
                                {subcategory.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-subcategories" disabled>No subcategories available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {loadingSubcategories && (
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Loading subcategories...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={currentArticle.status || 'draft'}
                        onValueChange={(value) => setCurrentArticle({ 
                          ...currentArticle, 
                          status: value as 'draft' | 'published' | 'archived' 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="space-y-2">
                    <Label htmlFor="featured_image">Featured Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="featured_image"
                        value={currentArticle?.featured_image || ''}
                        onChange={(e) => setCurrentArticle({ ...currentArticle, featured_image: e.target.value })}
                        placeholder="Featured image URL"
                      />
                      <div className="flex gap-2">
                        <CloudinaryUploader
                          onSuccess={(result) => {
                            if (currentArticle && result) {
                              const asset = Array.isArray(result) ? result[0] : result;
                              setCurrentArticle({
                                ...currentArticle,
                                featured_image: asset.publicId,
                              });
                            }
                          }}
                          folder="articles"
                          buttonLabel="Upload"
                        />
                        <CloudinaryMediaLibrary
                          onSelect={(publicId: string, url: string) => {
                            if (currentArticle) {
                              setCurrentArticle({
                                ...currentArticle,
                                featured_image: url,
                              });
                              toast({
                                title: "Image Selected",
                                description: "Featured image has been updated from Media Library",
                              });
                            }
                          }}
                          buttonText="Media Library"
                          variant="secondary"
                          supportedFileTypes={['image']}
                          onError={(error: Error) => {
                            toast({
                              title: "Error",
                              description: `Failed to open Media Library: ${error.message}`,
                              variant: "destructive",
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Blocks - simplified for now */}
                  <div>
                    <Label htmlFor="content" className="block mb-2">Article Content</Label>
                    <Textarea
                      id="content"
                      value={currentArticle.content 
                        ? (typeof currentArticle.content === 'string' 
                            ? currentArticle.content 
                            : JSON.stringify(currentArticle.content, null, 2))
                        : ''}
                      onChange={(e) => {
                        try {
                          // Simple content handling for this example
                          const contentValue = e.target.value;
                          let processedContent: any = contentValue;
                          
                          // Try to parse as JSON if it looks like it
                          if (contentValue.trim().startsWith('[') && contentValue.trim().endsWith(']')) {
                            try {
                              processedContent = JSON.parse(contentValue);
                            } catch (err) {
                              // Not valid JSON, treat as string
                              processedContent = [{
                                type: 'paragraph',
                                content: contentValue
                              }];
                            }
                          } else {
                            // Treat as simple text
                            processedContent = [{
                              type: 'paragraph',
                              content: contentValue
                            }];
                          }
                          
                          setCurrentArticle({ 
                            ...currentArticle, 
                            content: processedContent
                          });
                        } catch (error) {
                          console.error('Error updating content:', error);
                        }
                      }}
                      placeholder="Enter article content or JSON content blocks"
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter content as plain text or as a JSON array of content blocks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => currentArticle && saveArticle(currentArticle)}
                disabled={!currentArticle?.title || !currentArticle?.excerpt}
              >
                {isCreating ? 'Create Article' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Article Generation Dialog */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>AI Article Generator</DialogTitle>
              <DialogDescription>
                Generate article content using Claude AI. Provide a topic or description of what you want to write about.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Label htmlFor="ai-prompt" className="block mb-2">Topic or Description</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., Write an article about the benefits of EMSculpt Neo for body contouring, including details on how the technology works and who is the ideal candidate."
                    rows={5}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Select 
                  value={activeCategoryId !== 'all' ? activeCategoryId : ''}
                  onValueChange={setActiveCategoryId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAIN_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={generateArticleWithAI}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="flex items-center gap-2"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </Button>
              </div>

              {aiGenerated && (
                <div className="border rounded-md p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Generated Article</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyAiContent}
                    >
                      Use This Content
                    </Button>
                  </div>
                  <h4 className="text-lg font-medium">{aiGenerated.title}</h4>
                  {aiGenerated.subtitle && (
                    <p className="text-muted-foreground mb-2">{aiGenerated.subtitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">{aiGenerated.excerpt}</p>
                  <div className="max-h-96 overflow-y-auto prose prose-sm">
                    {typeof aiGenerated.content === 'string' ? (
                      <p>{aiGenerated.content}</p>
                    ) : Array.isArray(aiGenerated.content) ? (
                      aiGenerated.content.map((block, index) => {
                        if (block.type === 'paragraph') {
                          return <p key={index}>{block.content}</p>;
                        }
                        if (block.type === 'heading') {
                          return <h3 key={index} className="font-medium mt-4">{block.content}</h3>;
                        }
                        return null;
                      })
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this article? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedArticleId && deleteArticle(selectedArticleId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {currentCategory?.id ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {currentCategory?.id 
                  ? 'Update the category details below.'
                  : 'Fill in the details to create a new category.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={currentCategory?.name || ''}
                  onChange={(e) => setCurrentCategory({ 
                    ...currentCategory, 
                    name: e.target.value 
                  })}
                  placeholder="Category name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={currentCategory?.slug || ''}
                  onChange={(e) => setCurrentCategory({ 
                    ...currentCategory, 
                    slug: e.target.value 
                  })}
                  placeholder="category-slug (leave empty to generate from name)"
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Leave empty to generate automatically from name.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentCategory?.description || ''}
                  onChange={(e) => setCurrentCategory({ 
                    ...currentCategory, 
                    description: e.target.value 
                  })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              {currentCategory?.id && (
                <Button
                  variant="destructive"
                  onClick={() => currentCategory?.id && deleteCategory(currentCategory.id)}
                >
                  Delete Category
                </Button>
              )}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCategoryDialogOpen(false);
                  setCurrentCategory(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => currentCategory && saveCategory(currentCategory)}
                  disabled={!currentCategory?.name}
                >
                  {currentCategory?.id ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subcategory Dialog */}
        <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {currentSubcategory?.id ? 'Edit Subcategory' : 'Create Subcategory'}
              </DialogTitle>
              <DialogDescription>
                {currentSubcategory?.id 
                  ? 'Update the details of your subcategory.'
                  : 'Create a new subcategory for your articles.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory-name">Name</Label>
                <Input
                  id="subcategory-name"
                  placeholder="Enter subcategory name"
                  value={currentSubcategory?.name || ''}
                  onChange={(e) => setCurrentSubcategory({ ...currentSubcategory, name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subcategory-category">Category</Label>
                <Select
                  value={currentSubcategory?.category_id || ''}
                  onValueChange={(value) => setCurrentSubcategory({ ...currentSubcategory, category_id: value })}
                >
                  <SelectTrigger id="subcategory-category">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subcategory-description">Description (optional)</Label>
                <Textarea
                  id="subcategory-description"
                  placeholder="Enter subcategory description"
                  value={currentSubcategory?.description || ''}
                  onChange={(e) => setCurrentSubcategory({ ...currentSubcategory, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => saveSubcategory(currentSubcategory!)}>
                {currentSubcategory?.id ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Article Enhancement Dialog */}
        <Dialog open={isAiEnhancerDialogOpen} onOpenChange={setIsAiEnhancerDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>AI Article Enhancement</DialogTitle>
              <DialogDescription>
                Analyze and enhance your article with AI to improve SEO, engagement, and visuals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">Current Article</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Select an enhancement focus to get AI recommendations for improving your article.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={enhancementFocus}
                    onValueChange={(value: any) => setEnhancementFocus(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={enhanceArticleWithAI}
                    disabled={isEnhancing || !currentArticle}
                  >
                    {isEnhancing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...</>
                    ) : (
                      <><Wand2 className="mr-2 h-4 w-4" /> Enhance</>
                    )}
                  </Button>
                </div>
              </div>

              {currentArticle && (
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Title</h4>
                      <p className="text-sm">{currentArticle.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Subtitle</h4>
                      <p className="text-sm">{currentArticle.subtitle || 'None'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Excerpt</h4>
                    <p className="text-sm">{currentArticle.excerpt}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Meta Description</h4>
                    <p className="text-sm">
                      {currentArticle.meta_description || 'None'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Meta Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {(currentArticle.meta_keywords || []).length > 0 ? (
                        (currentArticle.meta_keywords || []).map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No keywords defined</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {enhancementPlan && (
                <div className="border rounded-md p-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">Enhancement Suggestions</h3>
                  
                  {/* Title Enhancement */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Title</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyEnhancement('title', enhancementPlan.title)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                    <p className="text-sm p-2 bg-muted rounded-md">{enhancementPlan.title}</p>
                  </div>
                  
                  {/* Subtitle Enhancement */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Subtitle</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyEnhancement('subtitle', enhancementPlan.subtitle)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                    <p className="text-sm p-2 bg-muted rounded-md">{enhancementPlan.subtitle}</p>
                  </div>
                  
                  {/* Meta Description */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Meta Description</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyEnhancement('meta_description', enhancementPlan.meta_description)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                    <p className="text-sm p-2 bg-muted rounded-md">{enhancementPlan.meta_description}</p>
                  </div>
                  
                  {/* Meta Keywords */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Meta Keywords</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyEnhancement('meta_keywords', enhancementPlan.meta_keywords)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md">
                      {enhancementPlan.meta_keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Structure Suggestions */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Content Structure Suggestions</h4>
                    <div className="p-2 bg-muted rounded-md">
                      {enhancementPlan.content_structure.map((item: any, index: number) => (
                        <div key={index} className="mb-3">
                          {item.type === 'heading' && <h5 className="font-medium text-sm">{item.content}</h5>}
                          {item.type === 'notes' && <p className="text-sm text-muted-foreground">{item.content}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Image Suggestions */}
                  {enhancementPlan.image_suggestions && enhancementPlan.image_suggestions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Image Suggestions</h4>
                      <div className="space-y-2">
                        {enhancementPlan.image_suggestions.map((suggestion: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded-md">
                            <p className="text-sm font-medium">{suggestion.purpose}</p>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Cloudinary Transformations */}
                  {enhancementPlan.cloudinary_transformations && enhancementPlan.cloudinary_transformations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Cloudinary Image Transformations</h4>
                      <div className="space-y-2">
                        {enhancementPlan.cloudinary_transformations.map((transform: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{transform.name}</p>
                                <p className="text-sm text-muted-foreground">{transform.purpose}</p>
                              </div>
                              <code className="text-xs bg-background p-1 rounded border">{transform.code}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAiEnhancerDialogOpen(false)}>
                Close
              </Button>
              {enhancementPlan && (
                <Button 
                  onClick={() => {
                    // Apply all enhancements at once
                    if (currentArticle && enhancementPlan) {
                      setCurrentArticle({
                        ...currentArticle,
                        title: enhancementPlan.title,
                        subtitle: enhancementPlan.subtitle,
                        meta_description: enhancementPlan.meta_description,
                        meta_keywords: enhancementPlan.meta_keywords,
                      });
                      
                      toast({
                        title: 'All Enhancements Applied',
                        description: 'Applied all AI enhancement suggestions to the article',
                      });
                      
                      setIsAiEnhancerDialogOpen(false);
                      setIsEditorOpen(true);
                    }
                  }}
                >
                  Apply All & Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ArticleManager; 