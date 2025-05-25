import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ImageUpload = ({
  value,
  onChange,
  onUpload,
  uploadEndpoint = '/media/upload',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5, // MB
  showAltText = false,
  showCaption = false,
  aspectRatio = 'aspect-video',
  placeholder = 'Click to upload or drag and drop',
  className = '',
  disabled = false
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value?.url || value || '');
  const [altText, setAltText] = useState(value?.alt_text || '');
  const [caption, setCaption] = useState(value?.caption || '');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = accept.split(',').map(type => type.trim());
    if (!validTypes.some(type => file.type.match(type))) {
      toast({
        title: 'Invalid file type',
        description: `Please upload a valid image file (${validTypes.join(', ')})`,
        variant: 'destructive'
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive'
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (showAltText && altText) {
        formData.append('alt_text', altText);
      }
      if (showCaption && caption) {
        formData.append('caption', caption);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const uploadedData = {
          url: data.data.variants?.medium?.url || data.data.original.url,
          thumbnail: data.data.variants?.thumbnail?.url,
          original: data.data.original.url,
          alt_text: altText,
          caption: caption,
          metadata: data.data.original.metadata
        };

        onChange(uploadedData);
        if (onUpload) onUpload(uploadedData);

        toast({
          title: 'Upload successful',
          description: 'Image uploaded successfully',
          variant: 'default'
        });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
      setPreview(value?.url || value || '');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setAltText('');
    setCaption('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateMetadata = () => {
    if (value && typeof value === 'object') {
      onChange({
        ...value,
        alt_text: altText,
        caption: caption
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative bg-zinc-800 border-2 border-dashed rounded-lg overflow-hidden transition-all ${
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700 hover:border-zinc-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          disabled={disabled}
        />

        <div className={`${aspectRatio} w-full`}>
          {preview ? (
            <div className="relative w-full h-full group">
              <img
                src={preview}
                alt={altText || 'Preview'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                  <span className="text-white text-sm">Uploading...</span>
                  {uploadProgress > 0 && (
                    <div className="w-32 h-2 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                  <p className="text-sm">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 mb-4" />
                  <p className="text-sm text-center">{placeholder}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: {maxSize}MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alt Text Input */}
      {showAltText && preview && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Alt Text
          </label>
          <Input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={updateMetadata}
            placeholder="Describe this image for accessibility"
            className="bg-zinc-900 border-zinc-700 text-white"
            disabled={disabled}
          />
        </div>
      )}

      {/* Caption Input */}
      {showCaption && preview && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Caption
          </label>
          <Input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={updateMetadata}
            placeholder="Add a caption for this image"
            className="bg-zinc-900 border-zinc-700 text-white"
            disabled={disabled}
          />
        </div>
      )}

      {/* Error State */}
      {!preview && !isUploading && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-yellow-500 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>No image uploaded</span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ImageUpload;