// Export all animation components
export { default as AnimatePresence } from './AnimatePresence.jsx';
export { default as ScrollReveal } from './ScrollReveal.jsx';
export { default as SkeletonLoader, CardSkeleton, NewsCardSkeleton, SkeletonList } from './SkeletonLoader.jsx';
export { default as ToastProvider, useToast } from './Toast.jsx';
export { default as EnhancedButton } from './EnhancedButton.jsx';
export { default as ParallaxEffect } from './ParallaxEffect.jsx';
export { default as EnhancedCard, EnhancedProductCard } from './EnhancedCard.jsx';
export { default as TypeWriter } from './TypeWriter.jsx';
export { default as PremiumWordCycler } from './PremiumWordCycler.jsx';
export { default as HeroSection } from './HeroSection.jsx';
export { default as DynamicHeroSection } from './DynamicHeroSection.jsx';
export { default as AnimatedCounter } from './AnimatedCounter.jsx';
export { default as FeaturedSection } from './FeaturedSection.jsx';
export { default as TestimonialsSection } from './TestimonialsSection.jsx';
export { default as AboutUsSection } from './AboutUsSection.jsx';
export { default as MeshGradient } from './MeshGradient.jsx';

// Export premium animation components
export { 
  default as PremiumAnimations,
  FloatingElement,
  GlowingBorder,
  GradientText,
  SlideInStagger,
  ShimmerEffect,
  ParticleOverlay,
  CinematicBlur,
  HoverSpotlight,
  TextReveal,
  MorphingShape
} from './PremiumAnimations.jsx';

// Animation utilities

/**
 * Debounces a function call
 * 
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export const debounce = (fn, wait = 100) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

/**
 * Returns true if user prefers reduced motion
 * 
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Generates a random number between min and max
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Lerp (linear interpolation) function
 * 
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} n - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
export const lerp = (a, b, n) => (1 - n) * a + n * b;