/**
 * Utility functions for optimizing performance
 */

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
 * Creates an intersection observer that calls a callback when element enters viewport
 * 
 * @param {Function} callback - Function to call when element enters viewport
 * @param {Object} options - IntersectionObserver options
 * @returns {IntersectionObserver}
 */
export const createIntersectionObserver = (callback, options = { threshold: 0.1 }) => {
  return new IntersectionObserver(callback, options);
};

/**
 * Defers non-critical operations until after main content is loaded
 * 
 * @param {Function} fn - Function to defer
 * @param {number} delay - Delay in ms
 */
export const deferOperation = (fn, delay = 500) => {
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      setTimeout(fn, delay);
    } else {
      window.addEventListener('load', () => setTimeout(fn, delay));
    }
  }
};

/**
 * Preloads images to prevent layout shifts and improve perceived performance
 * 
 * @param {string[]} imageUrls - Array of image URLs to preload
 * @returns {Promise<void>[]} - Array of promises that resolve when images are loaded
 */
export const preloadImages = (imageUrls) => {
  return imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(url);
      img.src = url;
    });
  });
};

/**
 * Conditionally applies animations based on device capabilities
 * Reduces animations on low-end devices
 * 
 * @returns {boolean} - True if device should use reduced animations
 */
export const shouldReduceAnimations = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  if (prefersReducedMotion()) return true;
  
  // Check for low-memory conditions
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
  
  // Check for slow connection
  if (navigator.connection) {
    const { effectiveType, saveData } = navigator.connection;
    if (saveData || ['slow-2g', '2g', '3g'].includes(effectiveType)) return true;
  }
  
  return false;
};

/**
 * Throttles a function to limit how often it can be called
 * 
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Time to wait between calls in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, wait = 100) => {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
};

/**
 * Load scripts asynchronously
 * 
 * @param {string} url - Script URL to load
 * @param {Function} callback - Callback to run when script is loaded
 */
export const loadScriptAsync = (url, callback) => {
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  
  if (callback) {
    script.onload = callback;
  }
  
  document.body.appendChild(script);
};

/**
 * Memoizes the result of a function to avoid recalculation
 * 
 * @param {Function} fn - Function to memoize
 * @returns {Function} - Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Determines if animations should run based on battery status
 * 
 * @returns {Promise<boolean>} - Promise that resolves to true if animations should run
 */
export const checkBatteryForAnimations = async () => {
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      // Disable animations if battery is below 15% and not charging
      return !(battery.level < 0.15 && !battery.charging);
    } catch (error) {
      // If we can't access battery info, default to allowing animations
      return true;
    }
  }
  
  return true;
};

export default {
  debounce,
  prefersReducedMotion,
  createIntersectionObserver,
  deferOperation,
  preloadImages,
  shouldReduceAnimations,
  throttle,
  loadScriptAsync,
  memoize,
  checkBatteryForAnimations
};