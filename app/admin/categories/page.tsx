'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArticleCategory } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      console.log('Fetching categories...');

      const response = await fetch('/api/categories', {
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      console.log('Categories response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load categories');
      }

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load categories',
        variant: 'destructive',
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory() {
    try {
      setSaving(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error('Failed to create category');

      const data = await response.json();
      setCategories([...categories, data]);
      setShowNewCategoryDialog(false);
      setNewCategory({ name: '', description: '' });
      
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleReorder(reorderedCategories: ArticleCategory[]) {
    setCategories(reorderedCategories);
    
    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: reorderedCategories.map((cat, index) => ({
            id: cat.id,
            order_position: index,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to update category order');
      
      toast({
        title: 'Success',
        description: 'Category order updated',
      });
    } catch (error) {
      console.error('Error updating category order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category order',
        variant: 'destructive',
      });
      // Reload categories to reset order
      loadCategories();
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-zinc-500">Manage and organize your article categories</p>
        </div>
        <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreateCategory}
                className="w-full"
                disabled={!newCategory.name || saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories List */}
      <Reorder.Group
        axis="y"
        values={filteredCategories}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {filteredCategories.map((category) => (
          <Reorder.Item
            key={category.id}
            value={category}
            className="bg-card rounded-lg p-4 shadow-sm cursor-move"
          >
            <div className="flex items-start gap-4">
              <GripVertical className="w-5 h-5 mt-1 text-zinc-500" />
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-zinc-500">{category.description}</p>
                <p className="text-xs text-zinc-400 mt-1">Slug: {category.slug}</p>
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
} 