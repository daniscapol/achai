import React, { useState, useEffect } from 'react';

// Fallback image to use if the specified image cannot be loaded
const DEFAULT_FALLBACK = 'https://ui-avatars.com/api/?name=Entity&background=random';

/**
 * Component for displaying entity images with fallback and error handling
 */
const EntityImagePreview = ({
  src,
  alt = 'Entity image',
  className = 'w-full h-full object-contain',
  fallbackSrc = DEFAULT_FALLBACK,
  entityName = '',
  size = 'md'
}) => {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);
  
  // Size classes
  const sizeClasses = {
    'sm': 'w-8 h-8',
    'md': 'w-12 h-12',
    'lg': 'w-16 h-16',
    'xl': 'w-24 h-24'
  };
  
  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);
  
  // Handle image loading error
  const handleError = () => {
    setHasError(true);
    
    // If we have an entity name, generate a custom avatar URL
    if (entityName && !imgSrc.includes('ui-avatars.com')) {
      setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(entityName)}&background=random`);
    } 
    // Otherwise use the provided fallback
    else if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    // Last resort default fallback
    else if (imgSrc !== DEFAULT_FALLBACK) {
      setImgSrc(DEFAULT_FALLBACK);
    }
  };
  
  // Check for temporary preview URL first (used during upload)
  if (!src && entityName) {
    // Generate a colored avatar based on entity name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(entityName)}&background=random`;
    return (
      <img 
        src={avatarUrl}
        alt={alt}
        className={className}
      />
    );
  }
  
  // If no source provided, show placeholder
  if (!src && !hasError) {
    return (
      <div className={`${sizeClasses[size] || 'w-12 h-12'} bg-zinc-800 rounded flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  
  // Render the image with error handling
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default EntityImagePreview;