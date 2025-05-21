import React from 'react';

/**
 * EnhancedButton component with hover effects and animations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'ghost')
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 * @param {boolean} props.disabled - Whether the button is disabled
 */
const EnhancedButton = ({ 
  children, 
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props 
}) => {
  // Get base classes based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/20';
      case 'secondary':
        return 'bg-zinc-800 hover:bg-zinc-700 text-white border border-purple-500/30 hover:border-purple-500/60';
      case 'ghost':
        return 'bg-transparent hover:bg-zinc-800/50 text-gray-200 hover:text-white';
      default:
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/20';
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };
  
  // Disabled state classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        relative
        rounded-md
        font-semibold
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabledClasses}
        transition-all duration-300
        flex items-center justify-center
        overflow-hidden
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {/* Hover effect overlay */}
      <span className="absolute inset-0 bg-white/10 scale-0 hover:scale-100 transition-transform duration-300 rounded-md" />
      
      {/* Button content with relative z-index */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
};

export default EnhancedButton;