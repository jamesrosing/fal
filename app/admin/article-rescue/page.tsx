'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export default function ArticleRescuePage() {
  const { toast } = useToast();
  const [articleId, setArticleId] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contentJson, setContentJson] = useState('');
  const [fixAction, setFixAction] = useState<'reset-content' | 'clear-content' | 'fix-structure'>('fix-structure');

  // Fetch article by ID
  const fetchArticle = async () => {
    if (!articleId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an article ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/fix-article/${articleId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setArticle(data.article);
      
      // Format content as JSON for editing
      setContentJson(JSON.stringify(data.article.content, null, 2));
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch article',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix article content
  const fixArticle = async () => {
    if (!article) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/fix-article/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: fixAction }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setArticle(data.article);
      setContentJson(JSON.stringify(data.article.content, null, 2));

      toast({
        title: 'Success',
        description: 'Article content has been fixed',
      });
    } catch (error) {
      console.error('Error fixing article:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix article content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Save custom content
  const saveCustomContent = async () => {
    if (!article) return;

    setSaving(true);
    try {
      // Parse the JSON content
      let parsedContent;
      try {
        parsedContent = JSON.parse(contentJson);
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'The content must be valid JSON',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Update the article with custom content
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...article,
          content: parsedContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setArticle(data);
      setContentJson(JSON.stringify(data.content, null, 2));

      toast({
        title: 'Success',
        description: 'Article content has been updated',
      });
    } catch (error) {
      console.error('Error saving custom content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save custom content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Article Rescue Tool</h1>
      <p className="text-muted-foreground mb-8">
        This tool helps fix problematic articles that cannot be edited in the regular admin interface.
      </p>

      <div className="grid gap-8">
        {/* Article ID Input */}
        <Card>
          <CardHeader>
            <CardTitle>Find Article</CardTitle>
            <CardDescription>
              Enter the ID of the article you want to fix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Article ID"
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                />
              </div>
              <Button onClick={fetchArticle} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  'Find Article'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Article Details */}
        {article && (
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Basic information about the article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>Title</Label>
                  <div className="p-2 border rounded-md bg-muted/30">
                    {article.title}
                  </div>
                </div>
                <div>
                  <Label>ID</Label>
                  <div className="p-2 border rounded-md bg-muted/30 font-mono text-sm">
                    {article.id}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="p-2 border rounded-md bg-muted/30">
                    {article.status}
                  </div>
                </div>
                <div>
                  <Label>Content Structure</Label>
                  <div className="p-2 border rounded-md bg-muted/30 font-mono text-sm">
                    {Array.isArray(article.content)
                      ? `Array with ${article.content.length} blocks`
                      : typeof article.content === 'string'
                      ? 'String (needs conversion to array)'
                      : article.content === null
                      ? 'NULL (needs initialization)'
                      : typeof article.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fix Options */}
        {article && (
          <Card>
            <CardHeader>
              <CardTitle>Fix Options</CardTitle>
              <CardDescription>
                Choose an automatic fix option or edit the content manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={fixAction === 'fix-structure' ? 'default' : 'outline'}
                    onClick={() => setFixAction('fix-structure')}
                  >
                    Fix Structure
                  </Button>
                  <Button
                    variant={fixAction === 'reset-content' ? 'default' : 'outline'}
                    onClick={() => setFixAction('reset-content')}
                  >
                    Reset Content
                  </Button>
                  <Button
                    variant={fixAction === 'clear-content' ? 'default' : 'outline'}
                    onClick={() => setFixAction('clear-content')}
                  >
                    Clear Content
                  </Button>
                </div>

                <div>
                  <Button 
                    onClick={fixArticle} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying Fix...
                      </>
                    ) : (
                      'Apply Selected Fix'
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="content-json" className="mb-2 block">
                    Manual Content Edit (JSON)
                  </Label>
                  <Textarea
                    id="content-json"
                    value={contentJson}
                    onChange={(e) => setContentJson(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Edit the content JSON directly. Make sure it's valid JSON and follows the correct structure.
                  </p>
                  <Button 
                    onClick={saveCustomContent} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Custom Content'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 