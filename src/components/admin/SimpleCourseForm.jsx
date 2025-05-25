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

// Form validation schema matching PostgreSQL table structure
const courseFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  slug: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  instructor_name: z.string().min(2, { message: "Instructor name is required" }),
  instructor_bio: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" }),
  currency: z.string().default("USD"),
  duration_hours: z.string().min(1, { message: "Duration is required" }),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  category_id: z.string().min(1, { message: "Category is required" }),
  status: z.enum(['draft', 'published'])
});

const SimpleCourseForm = ({ 
  initialData = null, 
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = "Save Course"
}) => {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      instructor_name: initialData?.instructor_name || '',
      instructor_bio: initialData?.instructor_bio || '',
      price: initialData?.price?.toString() || '0',
      currency: initialData?.currency || 'USD',
      duration_hours: initialData?.duration_hours?.toString() || '1',
      difficulty_level: initialData?.difficulty_level || 'beginner',
      category_id: initialData?.category_id?.toString() || '',
      status: initialData?.status || 'draft'
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
      // Convert string values to appropriate types
      const processedData = {
        ...data,
        price: parseFloat(data.price),
        duration_hours: parseFloat(data.duration_hours),
        category_id: parseInt(data.category_id)
      };
      await onSubmit(processedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save course',
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
                    placeholder="Enter course title" 
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
                    placeholder="course-slug" 
                    className="bg-zinc-800 border-zinc-700 text-white"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the course" 
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
                    placeholder="Course content and curriculum" 
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructor Name */}
            <FormField
              control={form.control}
              name="instructor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Instructor Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Instructor name" 
                      className="bg-zinc-800 border-zinc-700 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      className="bg-zinc-800 border-zinc-700 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Duration (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.5"
                      placeholder="1.0" 
                      className="bg-zinc-800 border-zinc-700 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty */}
            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="beginner" className="text-white hover:bg-zinc-700">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="text-white hover:bg-zinc-700">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="text-white hover:bg-zinc-700">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
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
                          key={category.id} 
                          value={category.id.toString()}
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="draft" className="text-white hover:bg-zinc-700">Draft</SelectItem>
                      <SelectItem value="published" className="text-white hover:bg-zinc-700">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Instructor Bio */}
          <FormField
            control={form.control}
            name="instructor_bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Instructor Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief bio of the instructor" 
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
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

export default SimpleCourseForm;