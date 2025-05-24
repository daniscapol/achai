import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Slider } from './slider';
import { Check, ChevronDown, ChevronUp, X, Filter, Star } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

/**
 * PremiumFilter component - A sophisticated, animated filter UI for product listings
 * 
 * @param {Object} props
 * @param {Array} props.categories - Available categories for filtering
 * @param {Function} props.onCategoryChange - Function called when category filter changes
 * @param {Array} props.types - Available product types for filtering
 * @param {Function} props.onTypeChange - Function called when type filter changes
 * @param {Function} props.onPriceRangeChange - Function called when price range changes
 * @param {Function} props.onRatingChange - Function called when rating filter changes
 * @param {Function} props.onSortChange - Function called when sort option changes
 * @param {Function} props.onClearFilters - Function called when filters are cleared
 * @param {Object} props.activeFilters - Currently active filters
 * @param {number} props.totalResults - Total number of results matching current filters
 */
const PremiumFilter = ({
  categories = [],
  types = [],
  onCategoryChange,
  onTypeChange,
  onPriceRangeChange,
  onRatingChange,
  onSortChange,
  onClearFilters,
  activeFilters = {
    categories: [],
    types: [],
    ratings: [],
    priceRange: { min: 0, max: 1000 }
  },
  sortOption = 'featured',
  totalResults = 0,
  maxPrice = 1000
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [localPriceRange, setLocalPriceRange] = useState(activeFilters.priceRange);
  const filterRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Track if any filters are active
  const hasActiveFilters = 
    activeFilters.categories.length > 0 || 
    activeFilters.types.length > 0 || 
    activeFilters.ratings.length > 0 ||
    activeFilters.priceRange.min > 0 || 
    activeFilters.priceRange.max < maxPrice;
  
  // Handle price range change (debounced)
  const handlePriceRangeChange = (values) => {
    setLocalPriceRange({ min: values[0], max: values[1] });
    
    // Debounce the actual update to avoid too many rerenders
    clearTimeout(priceRangeTimeout.current);
    priceRangeTimeout.current = setTimeout(() => {
      onPriceRangeChange({ min: values[0], max: values[1] });
    }, 300);
  };
  const priceRangeTimeout = useRef(null);
  
  // Handle scroll to implement sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!filterRef.current) return;
      
      const filterTop = filterRef.current.getBoundingClientRect().top;
      setIsSticky(filterTop <= 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Sort options with icons and descriptions
  const sortOptions = [
    { value: 'featured', label: 'Featured', icon: '✨', description: 'Our recommended products' },
    { value: 'name_asc', label: 'A-Z', icon: 'A→Z', description: 'Alphabetical order' },
    { value: 'name_desc', label: 'Z-A', icon: 'Z→A', description: 'Reverse alphabetical order' },
    { value: 'rating_desc', label: 'Highest Rated', icon: '★', description: 'Best rated products first' },
    { value: 'price_asc', label: 'Price: Low to High', icon: '$↑', description: 'Cheapest products first' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '$↓', description: 'Most expensive products first' },
    { value: 'newest', label: 'Newest', icon: '🆕', description: 'Recently added products' }
  ];
  
  // Get current sort option label
  const currentSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label || 'Featured';
  
  // Calculate total active filters count for badge
  const activeFiltersCount = 
    activeFilters.categories.length + 
    activeFilters.types.length + 
    activeFilters.ratings.length +
    (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < maxPrice ? 1 : 0);
  
  return (
    <div 
      ref={filterRef}
      className={`w-full transition-all duration-300 ${isSticky ? 'sticky top-0 z-40' : ''}`}
    >
      <div 
        className={`bg-zinc-900/80 backdrop-blur-md rounded-xl border ${hasActiveFilters ? 'border-purple-500/30' : 'border-zinc-800/70'} shadow-lg transition-all duration-300 ${isSticky ? 'shadow-xl' : ''}`}
      >
        {/* Filter header - always visible */}
        <div className="flex flex-col md:flex-row justify-between items-center p-3 md:p-4 gap-4">
          {/* Left side - Filter button and active filters count */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isOpen ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-purple-700 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </Button>
            
            {/* Active filters pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.categories.map(category => (
                <Badge
                  key={`cat-${category}`}
                  variant="outline"
                  className="bg-purple-950/40 border-purple-500/30 text-purple-300 px-2 py-1 flex items-center gap-1 group"
                >
                  <span className="max-w-32 truncate">{category}</span>
                  <button
                    onClick={() => onCategoryChange(category)}
                    className="text-purple-400 hover:text-white rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeFilters.types.map(type => (
                <Badge
                  key={`type-${type}`}
                  variant="outline"
                  className="bg-indigo-950/40 border-indigo-500/30 text-indigo-300 px-2 py-1 flex items-center gap-1 group"
                >
                  <span className="max-w-32 truncate">{type === 'custom-product' ? 'Product' : type}</span>
                  <button
                    onClick={() => onTypeChange(type)}
                    className="text-indigo-400 hover:text-white rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeFilters.ratings.map(rating => (
                <Badge
                  key={`rating-${rating}`}
                  variant="outline"
                  className="bg-amber-950/40 border-amber-500/30 text-amber-300 px-2 py-1 flex items-center gap-1 group"
                >
                  <span className="flex items-center">
                    {rating}+ <Star className="h-3 w-3 ml-0.5 fill-amber-400 text-amber-400" />
                  </span>
                  <button
                    onClick={() => onRatingChange(rating)}
                    className="text-amber-400 hover:text-white rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {(activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < maxPrice) && (
                <Badge
                  variant="outline"
                  className="bg-emerald-950/40 border-emerald-500/30 text-emerald-300 px-2 py-1 flex items-center gap-1 group"
                >
                  <span>${activeFilters.priceRange.min} - ${activeFilters.priceRange.max}</span>
                  <button
                    onClick={() => onPriceRangeChange({ min: 0, max: maxPrice })}
                    className="text-emerald-400 hover:text-white rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs text-purple-400 hover:text-purple-300 ml-1"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          {/* Right side - Sort dropdown and results count */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Results count */}
            {totalResults > 0 && (
              <div className="hidden md:flex text-sm text-gray-400 items-center">
                <span>{totalResults} product{totalResults !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {/* Sort dropdown */}
            <div className="group relative ml-auto">
              <Button
                variant="outline" 
                className="bg-zinc-800 border-zinc-700 text-gray-300 hover:border-purple-500/50 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('sort');
                  setIsOpen(!isOpen);
                }}
              >
                <div className="flex items-center gap-2">
                  <span>Sort: {currentSortLabel}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen && activeTab === 'sort' ? 'rotate-180' : ''}`} />
                </div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Expandable filter panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-zinc-700 bg-zinc-900/95 rounded-b-xl">
                {/* Filter tabs */}
                <div className="flex border-b border-zinc-700 -mx-4 px-4 mb-4">
                  <button
                    className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                      activeTab === 'categories' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('categories')}
                  >
                    Categories
                    {activeTab === 'categories' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                      activeTab === 'types' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('types')}
                  >
                    Product Types
                    {activeTab === 'types' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                      activeTab === 'price' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('price')}
                  >
                    Price
                    {activeTab === 'price' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                      activeTab === 'ratings' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('ratings')}
                  >
                    Ratings
                    {activeTab === 'ratings' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                      activeTab === 'sort' 
                        ? 'text-purple-400' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('sort')}
                  >
                    Sort
                    {activeTab === 'sort' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                </div>
                
                {/* Tab content */}
                <div className="py-2">
                  {/* Categories tab */}
                  {activeTab === 'categories' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
                    >
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <Badge
                            key={category}
                            variant="outline"
                            className={`py-3 px-4 cursor-pointer transition-all duration-300 flex items-center justify-between rounded-lg font-medium ${
                              activeFilters.categories.includes(category)
                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 border-purple-400 text-white shadow-lg hover:shadow-purple-500/25'
                                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-gray-200 hover:border-purple-400 shadow-sm'
                            }`}
                            onClick={() => onCategoryChange(category)}
                          >
                            <span className="truncate mr-2 text-sm font-medium">{category}</span>
                            {activeFilters.categories.includes(category) && (
                              <Check className="h-4 w-4 text-white flex-shrink-0" />
                            )}
                          </Badge>
                        ))
                      ) : (
                        <div className="col-span-full text-gray-500 text-center py-6">
                          No categories available
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Types tab */}
                  {activeTab === 'types' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                    >
                      {types.length > 0 ? (
                        types.map(type => (
                          <Badge
                            key={type}
                            variant="outline"
                            className={`py-3 px-4 cursor-pointer transition-all duration-300 flex items-center justify-between rounded-lg font-medium ${
                              activeFilters.types.includes(type)
                                ? type === 'server' ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400 text-white shadow-lg hover:shadow-blue-500/25' : 
                                  type === 'client' ? 'bg-gradient-to-r from-green-600 to-green-500 border-green-400 text-white shadow-lg hover:shadow-green-500/25' : 
                                  type === 'ai-agent' ? 'bg-gradient-to-r from-orange-600 to-orange-500 border-orange-400 text-white shadow-lg hover:shadow-orange-500/25' : 
                                  'bg-gradient-to-r from-purple-600 to-purple-500 border-purple-400 text-white shadow-lg hover:shadow-purple-500/25'
                                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-gray-200 hover:border-purple-400 shadow-sm'
                            }`}
                            onClick={() => onTypeChange(type)}
                          >
                            <span className="truncate mr-2 text-sm font-medium">{type === 'custom-product' ? 'Product' : type}</span>
                            {activeFilters.types.includes(type) && (
                              <Check className="h-4 w-4 text-white flex-shrink-0" />
                            )}
                          </Badge>
                        ))
                      ) : (
                        <div className="col-span-full text-gray-500 text-center py-6">
                          No product types available
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Price tab */}
                  {activeTab === 'price' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 px-2"
                    >
                      <div className="pt-6 px-6">
                        <Slider
                          defaultValue={[localPriceRange.min, localPriceRange.max]}
                          value={[localPriceRange.min, localPriceRange.max]}
                          max={maxPrice}
                          step={5}
                          minStepsBetweenThumbs={1}
                          onValueChange={handlePriceRangeChange}
                          className="mb-6"
                        />
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="bg-purple-600 rounded-md px-3 py-1.5 text-white min-w-16 text-center font-medium">
                            ${localPriceRange.min}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">to</div>
                          <div className="bg-purple-600 rounded-md px-3 py-1.5 text-white min-w-16 text-center font-medium">
                            ${localPriceRange.max}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-3">
                        <Button 
                          variant="outline"
                          className="bg-zinc-800 border-zinc-600 text-gray-200 hover:border-purple-500 hover:bg-zinc-700"
                          onClick={() => onPriceRangeChange({ min: 0, max: maxPrice })}
                        >
                          Reset
                        </Button>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Ratings tab */}
                  {activeTab === 'ratings' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-wrap gap-2 justify-center"
                    >
                      {[5, 4, 3, 2, 1].map(rating => (
                        <Badge
                          key={rating}
                          variant="outline"
                          className={`py-2 px-3 cursor-pointer transition-all duration-300 ${
                            activeFilters.ratings.includes(rating)
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-400 text-white shadow-lg hover:shadow-amber-500/25'
                              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-gray-200 hover:border-amber-400 shadow-sm'
                          }`}
                          onClick={() => onRatingChange(rating)}
                        >
                          <div className="flex items-center">
                            <span className="mr-1 font-medium">{rating}+</span>
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3.5 w-3.5 ${
                                  i < rating 
                                    ? activeFilters.ratings.includes(rating) 
                                      ? 'text-white fill-white' 
                                      : 'text-amber-400 fill-amber-400'
                                    : activeFilters.ratings.includes(rating)
                                      ? 'text-amber-200 fill-amber-200'
                                      : 'text-gray-500'
                                }`} 
                              />
                            ))}
                            {activeFilters.ratings.includes(rating) && (
                              <Check className="h-3.5 w-3.5 ml-1.5 text-white" />
                            )}
                          </div>
                        </Badge>
                      ))}
                    </motion.div>
                  )}
                  
                  {/* Sort tab */}
                  {activeTab === 'sort' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    >
                      {sortOptions.map(option => (
                        <div
                          key={option.value}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                            sortOption === option.value
                              ? 'bg-gradient-to-r from-purple-600 to-purple-500 border border-purple-400 text-white shadow-lg hover:shadow-purple-500/25'
                              : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-gray-200 hover:border-purple-400 shadow-sm'
                          }`}
                          onClick={() => {
                            onSortChange(option.value);
                            setTimeout(() => setIsOpen(false), 300);
                          }}
                        >
                          <div className={`mr-3 text-center flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                            sortOption === option.value
                              ? 'bg-purple-700 text-white'
                              : 'bg-zinc-700 text-gray-400'
                          }`}>
                            <span>{option.icon}</span>
                          </div>
                          <div className="flex-grow">
                            <div className={`text-sm font-medium ${
                              sortOption === option.value ? 'text-white' : 'text-gray-200'
                            }`}>
                              {option.label}
                            </div>
                            <div className={`text-xs ${
                              sortOption === option.value ? 'text-purple-100' : 'text-gray-400'
                            }`}>
                              {option.description}
                            </div>
                          </div>
                          {sortOption === option.value && (
                            <Check className="h-5 w-5 text-white ml-2" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PremiumFilter;