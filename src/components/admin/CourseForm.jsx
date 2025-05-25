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
  DollarSign, 
  Clock, 
  User,
  BookOpen,
  Tags,
  Image,
  Info,
  Award
} from 'lucide-react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Form validation schema
const courseFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  slug: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  thumbnail: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  instructor_name: z.string().min(2, { message: "Instructor name is required" }),
  instructor_bio: z.string().optional(),
  instructor_photo: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  price: z.coerce.number().min(0, { message: "Price must be 0 or greater" }),
  currency: z.string().length(3, { message: "Currency must be 3 characters (e.g., USD)" }),
  duration_hours: z.coerce.number().min(0.5, { message: "Duration must be at least 0.5 hours" }),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  category_id: z.coerce.number().int().positive({ message: "Please select a category" }),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  enrollment_limit: z.coerce.number().optional(),
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional()
});

const CourseForm = ({ 
  initialData = null, 
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = "Save Course"
}) => {
  const { toast } = useToast();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [instructorPhotoFile, setInstructorPhotoFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail || '');
  const [instructorPhotoPreview, setInstructorPhotoPreview] = useState(initialData?.instructor_photo || '');

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      thumbnail: initialData?.thumbnail || '',
      instructor_name: initialData?.instructor_name || '',
      instructor_bio: initialData?.instructor_bio || '',
      instructor_photo: initialData?.instructor_photo || '',
      price: initialData?.price || 0,
      currency: initialData?.currency || 'USD',
      duration_hours: initialData?.duration_hours || 1,
      difficulty_level: initialData?.difficulty_level || 'beginner',
      category_id: initialData?.category_id || '',
      tags: initialData?.tags || [],
      status: initialData?.status || 'draft',
      enrollment_limit: initialData?.enrollment_limit || '',
      prerequisites: initialData?.prerequisites || [],
      learning_objectives: initialData?.learning_objectives || []
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
  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'thumbnail') {
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (type === 'instructor') {
        setInstructorPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setInstructorPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
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

      // Upload images if selected
      if (thumbnailFile) {
        const uploadedUrl = await uploadImage(thumbnailFile);
        if (uploadedUrl) {
          finalData.thumbnail = uploadedUrl;
        }
      }

      if (instructorPhotoFile) {
        const uploadedUrl = await uploadImage(instructorPhotoFile);
        if (uploadedUrl) {
          finalData.instructor_photo = uploadedUrl;
        }
      }

      // Auto-generate slug if empty
      if (!finalData.slug) {
        finalData.slug = finalData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      await onSubmit(finalData);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Introduction to Machine Learning"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3}
                    placeholder="A comprehensive introduction to machine learning concepts..."
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  Brief description that appears in course listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Thumbnail</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(data) => {
                      const imageUrl = data?.url || data;
                      field.onChange(imageUrl);
                    }}
                    uploadEndpoint="/media/upload/course-thumbnail"
                    showAltText={true}
                    aspectRatio="aspect-video"
                    placeholder="Click to upload or drag and drop course thumbnail"
                  />
                </FormControl>
                <FormDescription>
                  Upload a thumbnail image for your course (JPG, PNG, WebP - Max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Instructor Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <User className="h-5 w-5" />
            Instructor Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="instructor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Dr. Jane Smith"
                      className="bg-zinc-800 border-zinc-700 text-gray-200" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructor_photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor Photo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(data) => {
                        const imageUrl = data?.url || data;
                        field.onChange(imageUrl);
                      }}
                      uploadEndpoint="/media/upload/instructor-photo"
                      aspectRatio="aspect-square"
                      placeholder="Upload instructor photo"
                      className="max-w-xs"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a professional photo of the instructor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="instructor_bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3}
                    placeholder="Brief bio about the instructor's expertise and experience..."
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {instructorPhotoPreview && (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
              <img 
                src={instructorPhotoPreview} 
                alt="Instructor" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Course Details Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="duration_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hours) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        {...field} 
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="10.5"
                        className="bg-zinc-800 border-zinc-700 text-gray-200 pl-10" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          Advanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="49.99"
                        className="bg-zinc-800 border-zinc-700 text-gray-200 pl-10" 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Set to 0 for free courses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="USD"
                      maxLength={3}
                      className="bg-zinc-800 border-zinc-700 text-gray-200 uppercase" 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    3-letter currency code (USD, EUR, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="enrollment_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment Limit</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    className="bg-zinc-800 border-zinc-700 text-gray-200" 
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of students (leave empty for unlimited)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Course Content Section */}
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Content
          </h3>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Content *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Detailed course content, curriculum, and materials..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prerequisites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisites</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add prerequisite..."
                    maxTags={10}
                  />
                </FormControl>
                <FormDescription>
                  Required knowledge or skills before taking this course
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="learning_objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Objectives</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add learning objective..."
                    maxTags={10}
                  />
                </FormControl>
                <FormDescription>
                  What students will learn from this course
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

export default CourseForm;