'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Save, Image as ImageIcon, Video, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Article, ArticleContent, ArticleCategory } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Client component wrapped by the async Server Component
function ArticleEditorClient({
  id,
  searchParams = {}
}: {
  id: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [showAIDialog, setShowAIDialog] = useState(false);

  useEffect(() => {
    Promise.all([
      id !== 'new' ? loadArticle() : Promise.resolve(),
      loadCategories()
    ]).finally(() => {
      if (id === 'new') {
        setArticle({
          id: '',
          title: '',
          subtitle: '',
          slug: '',
          content: [],
          excerpt: '',
          author_id: '', // TODO: Get from auth context
          category_id: '',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Article);
      }
      setLoading(false);
    });
  }, [id]);

  async function loadArticle() {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error('Failed to load article');
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  }

  async function handleSave() {
    if (!article) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/articles/${id === 'new' ? '' : id}`, {
        method: id === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) throw new Error('Failed to save article');

      toast({
        title: 'Success',
        description: 'Article saved successfully',
      });

      if (id === 'new') {
        const data = await response.json();
        router.push(`/admin/articles/${data.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function generateWithAI(prompt: string) {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'article',
          context: {
            title: article?.title,
            excerpt: article?.excerpt,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      
      if (article) {
        setArticle({
          ...article,
          content: [...(article.content || []), ...data.content],
        });
      }

      setShowAIDialog(false);
      toast({
        title: 'Success',
        description: 'Content generated successfully',
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {id === 'new' ? 'New Article' : 'Edit Article'}
          </h1>
          <p className="text-zinc-500">Create and edit your article content</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Content Generation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>What would you like to generate?</Label>
                  <Textarea
                    placeholder="E.g., Generate an introduction about the benefits of EMSculpt..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={() => generateWithAI('Your prompt here')}
                  className="w-full"
                >
                  Generate Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  placeholder="Article title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                <Input
                  id="subtitle"
                  value={article.subtitle || ''}
                  onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
                  placeholder="Article subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={article.category_id}
                  onValueChange={(value) => setArticle({ ...article, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt}
                  onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                  placeholder="Brief description of the article"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="write">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="space-y-4">
                  {article.content.map((block, index) => (
                    <div key={index} className="space-y-2">
                      <Textarea
                        value={block.content}
                        onChange={(e) => {
                          const newContent = [...article.content];
                          newContent[index] = {
                            ...block,
                            content: e.target.value,
                          };
                          setArticle({ ...article, content: newContent });
                        }}
                        rows={4}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setArticle({
                        ...article,
                        content: [
                          ...article.content,
                          { type: 'paragraph', content: '' },
                        ],
                      });
                    }}
                  >
                    Add Paragraph
                  </Button>
                </TabsContent>
                <TabsContent value="preview">
                  {/* Add preview rendering */}
                  Preview content here
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={article.status}
                  onValueChange={(value: Article['status']) => 
                    setArticle({ ...article, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Button variant="outline" className="w-full">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured Video (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Button variant="outline" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={article.meta_description || ''}
                  onChange={(e) => setArticle({ ...article, meta_description: e.target.value })}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input
                  id="meta-keywords"
                  value={article.meta_keywords?.join(', ') || ''}
                  onChange={(e) => setArticle({ ...article, meta_keywords: e.target.value.split(',').map(k => k.trim()) })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Server component that wraps the client component
export default async function ArticleEditor({ 
  params,
  searchParams 
}: {
  params: { id: string },
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Extract the ID from params and pass it to the client component
  return <ArticleEditorClient id={params.id} searchParams={searchParams} />;
} 