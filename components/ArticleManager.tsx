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

// Main categories for articles
const MAIN_CATEGORIES = [
  "plastic-surgery",
  "dermatology", 
  "functional-medicine",
  "medical-spa"
];

interface ArticleManagerProps {
  initialCategoryId?: string;
}

export function ArticleManager({ initialCategoryId }: ArticleManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategoryId || 'all');
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
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  // Filter articles based on search query, category, and status
  const filteredArticles = articles.filter(article => {
    // Check if article matches the search query
    const matchesSearch = 
      searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Check if article matches the selected category
    const matchesCategory = 
      activeCategoryId === 'all' || 
      article.category_id === activeCategoryId;
    
    // Check if article matches the selected status
    const matchesStatus = 
      statusFilter === 'all' || 
      article.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
        if (typeof articleToSave.content === 'string') {
          try {
            articleToSave.content = JSON.parse(articleToSave.content);
          } catch (e) {
            // If not valid JSON, treat as a single paragraph
            articleToSave.content = [{ 
              type: 'paragraph' as const, 
              content: typeof articleToSave.content === 'string' 
                ? articleToSave.content 
                : String(articleToSave.content || '')
            }];
          }
        } else if (!Array.isArray(articleToSave.content)) {
          // If it's an object but not an array, wrap it in an array
          articleToSave.content = [articleToSave.content as any];
        }
      } else {
        articleToSave.content = [];
      }
      
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
              onValueChange={setActiveCategoryId}
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
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="plastic-surgery">Plastic Surgery</TabsTrigger>
            <TabsTrigger value="dermatology">Dermatology</TabsTrigger>
            <TabsTrigger value="functional-medicine">Functional Medicine</TabsTrigger>
            <TabsTrigger value="medical-spa">Medical Spa</TabsTrigger>
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
              const category = categories.find(c => c.id === article.category_id);
              
              return (
                <Card key={article.id} className="overflow-hidden">
                  {article.featured_image ? (
                    <div className="relative h-48 w-full">
                      <CloudinaryImage
                        publicId={article.featured_image}
                        alt={article.title}
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
                          <DropdownMenuItem onClick={() => router.push(`/articles/${article.slug}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
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
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    {article.subtitle && (
                      <CardDescription className="line-clamp-1">{article.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-3">
                      {article.excerpt}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        article.status === 'published' ? 'bg-green-500' : 
                        article.status === 'draft' ? 'bg-amber-500' : 'bg-gray-500'
                      }`} />
                      <span className="capitalize">{article.status}</span>
                    </div>
                    <div>
                      {format(new Date(article.created_at), 'MMM d, yyyy')}
                    </div>
                  </CardFooter>
                </Card>
              );
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
                        onValueChange={(value) => setCurrentArticle({ ...currentArticle, category_id: value })}
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
                  <div>
                    <Label className="block mb-2">Featured Image</Label>
                    {currentArticle.featured_image ? (
                      <div className="relative aspect-video mb-2 border rounded-md overflow-hidden">
                        <CloudinaryImage
                          publicId={currentArticle.featured_image}
                          alt="Featured image"
                          className="object-cover w-full h-full"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setCurrentArticle({ ...currentArticle, featured_image: undefined })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/30">
                        <CloudinaryUploader
                          area="article"
                          folder="articles/featured"
                          onSuccess={handleImageUpload}
                          buttonLabel="Upload Featured Image"
                        />
                      </div>
                    )}
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
      </div>
    </div>
  );
}

export default ArticleManager; 