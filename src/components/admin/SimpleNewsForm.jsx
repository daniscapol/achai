import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Switch } from '../ui/switch';

// Form validation schema matching PostgreSQL table structure
const newsFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  slug: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  summary: z.string().max(500, { message: "Summary must be less than 500 characters" }).optional(),
  author: z.string().min(2, { message: "Author name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  is_published: z.boolean()
});

const SimpleNewsForm = ({ 
  initialData = null, 
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = "Save Article"
}) => {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      summary: initialData?.summary || initialData?.excerpt || '',
      author: initialData?.author || 'ACHAI Team',
      category: initialData?.category || '',
      is_published: initialData?.is_published || false
    }
  });

  // Watch title changes to auto-generate slug
  const watchedTitle = form.watch('title');
  useEffect(() => {
    if (!initialData && watchedTitle && !form.getValues('slug')) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', generatedSlug);
    }
  }, [watchedTitle, initialData, form]);

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter article title" 
                    className="bg-zinc-800 border-zinc-700 text-white"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Slug</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="article-slug" 
                    className="bg-zinc-800 border-zinc-700 text-white"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Summary */}
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Summary</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief summary of the article" 
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Article content (Markdown supported)" 
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[300px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Author</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Author name" 
                    className="bg-zinc-800 border-zinc-700 text-white"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.slug || category.name} 
                        value={category.name}
                        className="text-white hover:bg-zinc-700"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Status */}
          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-gray-200">
                    Published
                  </FormLabel>
                  <div className="text-sm text-gray-400">
                    Make this article visible to the public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SimpleNewsForm;