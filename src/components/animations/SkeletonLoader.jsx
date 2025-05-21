import React from 'react';

/**
 * SkeletonLoader component - animated placeholder for loading content
 * 
 * @param {Object} props
 * @param {string} props.variant - Skeleton variant ('text', 'circle', 'rect')
 * @param {number} props.width - Width of the skeleton (px or %)
 * @param {number} props.height - Height of the skeleton (px)
 * @param {string} props.className - Additional CSS classes
 */
const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  // Determine shape based on variant
  const getShapeClasses = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'rect':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded';
    }
  };
  
  // Calculate dimensions
  const getStyle = () => {
    const style = {};
    
    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    } else if (variant === 'text') {
      style.height = '1em';
    } else if (variant === 'circle' && width) {
      style.height = style.width; // Make circle dimensions equal
    }
    
    return style;
  };
  
  return (
    <div
      className={`animate-pulse bg-zinc-700/70 ${getShapeClasses()} ${className}`}
      style={getStyle()}
      {...props}
    />
  );
};

/**
 * CardSkeleton - Skeleton loader for card layout
 */
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden ${className}`}>
      {/* Image placeholder */}
      <SkeletonLoader variant="rect" height={200} className="w-full" />
      
      {/* Content placeholders */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonLoader variant="text" width="70%" height={24} className="mb-2" />
        
        {/* Description lines */}
        <SkeletonLoader variant="text" width="100%" height={16} />
        <SkeletonLoader variant="text" width="90%" height={16} />
        <SkeletonLoader variant="text" width="80%" height={16} />
        
        {/* Footer metadata */}
        <div className="flex justify-between pt-2">
          <SkeletonLoader variant="text" width={80} height={16} />
          <SkeletonLoader variant="text" width={60} height={16} />
        </div>
      </div>
    </div>
  );
};

/**
 * NewsCardSkeleton - Skeleton loader for news card layout
 */
export const NewsCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden ${className}`}>
      {/* Image placeholder with gradient */}
      <div className="h-56 bg-gradient-to-br from-zinc-700/30 to-zinc-700/60 flex items-center justify-center">
        <SkeletonLoader variant="circle" width={60} height={60} />
      </div>
      
      {/* Content placeholders */}
      <div className="p-6 space-y-3 -mt-10 relative z-10">
        {/* Category badge */}
        <SkeletonLoader variant="rect" width={100} height={20} className="rounded-full" />
        
        {/* Title */}
        <SkeletonLoader variant="text" width="90%" height={28} className="mb-2" />
        
        {/* Summary lines */}
        <SkeletonLoader variant="text" width="100%" height={16} />
        <SkeletonLoader variant="text" width="95%" height={16} />
        <SkeletonLoader variant="text" width="90%" height={16} />
        
        {/* Tags */}
        <div className="flex gap-2 pt-2">
          <SkeletonLoader variant="rect" width={70} height={24} className="rounded-full" />
          <SkeletonLoader variant="rect" width={80} height={24} className="rounded-full" />
          <SkeletonLoader variant="rect" width={60} height={24} className="rounded-full" />
        </div>
        
        {/* Metadata */}
        <div className="flex justify-between pt-4 border-t border-zinc-700/50 mt-4">
          <SkeletonLoader variant="text" width={120} height={16} />
          <SkeletonLoader variant="text" width={80} height={16} />
        </div>
      </div>
      
      {/* Button placeholder */}
      <div className="px-5 pb-5">
        <SkeletonLoader variant="rect" width="100%" height={40} className="rounded-md" />
      </div>
    </div>
  );
};

/**
 * SkeletonList - Creates multiple skeleton items in a list
 */
export const SkeletonList = ({ 
  count = 3, 
  variant = 'text',
  gap = 'gap-4',
  ...props 
}) => {
  return (
    <div className={`space-y-${gap}`}>
      {[...Array(count)].map((_, index) => (
        <SkeletonLoader 
          key={index} 
          variant={variant} 
          {...props} 
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;