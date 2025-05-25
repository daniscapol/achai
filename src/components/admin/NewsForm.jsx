import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
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
import RichTextEditor from './RichTextEditor';
import TagInput from './TagInput';
import ImageUpload from '../ui/ImageUpload';
import { 
  Upload, 
  Calendar, 
  Globe, 
  FileText, 
  Tags,
  Link,
  X
} from 'lucide-react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Form validation schema
const newsFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  slug: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  summary: z.string().max(500, { message: "Summary must be less than 500 characters" }).optional(),
  author: z.string().min(2, { message: "Author name is required" }),
  category: z.string().min(2, { message: "Category is required" }),
  is_published: z.boolean()
});

const NewsForm = ({ 
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

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      let finalData = { ...data };

      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalData.featured_image = uploadedUrl;
        }
      }

      // Auto-generate slug if empty
      if (!finalData.slug) {
        finalData.slug = finalData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Set published_at if publishing
      if (finalData.status === 'published' && !finalData.published_at) {
        finalData.published_at = new Date().toISOString();
      }

      await onSubmit(finalData);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Main Content Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content
          </h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter article title"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="auto-generated-from-title"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  Leave empty to auto-generate from title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your article content here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3}
                    placeholder="Brief summary of the article"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  A short summary that appears in article listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Media Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media
          </h3>

          <FormField
            control={form.control}
            name="featured_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(data) => {
                      // If data is an object with URL, use the URL
                      const imageUrl = data?.url || data;
                      field.onChange(imageUrl);
                    }}
                    uploadEndpoint="/media/upload/news"
                    showAltText={true}
                    showCaption={true}
                    aspectRatio="aspect-video"
                    placeholder="Click to upload or drag and drop your featured image"
                  />
                </FormControl>
                <FormDescription>
                  Upload a featured image for your article (JPG, PNG, WebP - Max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Organization Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Organization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-gray-200">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-gray-200">
                        <SelectValue placeholder="Select an author" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {authors.map(author => (
                        <SelectItem key={author.id} value={author.id.toString()}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add tags..."
                  />
                </FormControl>
                <FormDescription>
                  Press Enter or comma to add a tag
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publishing Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publishing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      className="bg-zinc-800 border-zinc-700 text-gray-200" 
                    />
                  </FormControl>
                  <FormDescription>
                    Schedule when the article should be published
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO
          </h3>

          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="SEO optimized title"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/60 characters (defaults to article title)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={2}
                    placeholder="SEO description for search engines"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/160 characters (defaults to excerpt)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Keywords</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="keyword1, keyword2, keyword3"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated keywords for SEO
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={uploadingImage}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewsForm;