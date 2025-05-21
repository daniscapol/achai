import React, { useState, useRef, useEffect } from 'react';

const FeaturedCarousel = ({ title, items, onItemClick }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef(null);
  
  // Update scroll state on window resize
  useEffect(() => {
    const updateScrollState = () => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        setScrollWidth(container.scrollWidth);
        setContainerWidth(container.clientWidth);
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }
    };
    
    // Initial update
    updateScrollState();
    
    // Add resize listener
    window.addEventListener('resize', updateScrollState);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateScrollState);
  }, [items]);
  
  // Update scroll state on scroll
  const handleScroll = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollPos = container.scrollLeft;
      setScrollPosition(scrollPos);
      setCanScrollLeft(scrollPos > 5); // Small threshold to account for precision issues
      setCanScrollRight(scrollPos < container.scrollWidth - container.clientWidth - 5);
    }
  };
  
  // Scroll left
  const scrollLeft = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollAmount = Math.min(container.clientWidth * 0.8, scrollPosition);
      const newPosition = Math.max(scrollPosition - scrollAmount, 0);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };
  
  // Scroll right
  const scrollRight = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollAmount = container.clientWidth * 0.8;
      const newPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };
  
  // Return null if no items are provided
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        
        {/* Navigation controls for larger screens */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            className={`p-2 rounded-full ${canScrollLeft 
              ? 'bg-zinc-800 text-white hover:bg-purple-600' 
              : 'bg-zinc-800/50 text-gray-500 cursor-not-allowed'}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded-full ${canScrollRight 
              ? 'bg-zinc-800 text-white hover:bg-purple-600' 
              : 'bg-zinc-800/50 text-gray-500 cursor-not-allowed'}`} 
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="relative group">
        {/* Left arrow (mobile) */}
        <button 
          className={`md:hidden absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-r-lg p-3 z-10 
                    ${canScrollLeft ? 'opacity-50 group-hover:opacity-100' : 'opacity-0 pointer-events-none'} 
                    transition-opacity duration-300`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Carousel container with scroll event listener */}
        <div 
          ref={carouselRef}
          className="overflow-x-auto flex space-x-4 pb-4 scrollbar-hide relative scroll-smooth"
          onScroll={handleScroll}
        >
          {/* Styled items with dynamic sizing based on position */}
          {items.map((item, index) => {
            // Get star display information
            const stars = item.stars_numeric || item.stars || 0;
            const starsDisplay = typeof stars === 'number' ? stars.toLocaleString() : stars.toString();
            
            // Is this the featured item?
            const isFeatured = index === 0;
            
            return (
              <div 
                key={item.id || index}
                className={`flex-shrink-0 cursor-pointer group/item transition-all duration-300 ease-out hover:scale-105 
                          ${isFeatured ? 'hover:rotate-1' : 'hover:-rotate-1'}`}
                style={{ width: isFeatured ? '380px' : '280px' }}
                onClick={() => onItemClick(item.id)}
              >
                {/* Card container with gradient */}
                <div className={`rounded-lg overflow-hidden ${isFeatured ? 'h-64 md:h-72' : 'h-48 md:h-64'} relative 
                                bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg border border-zinc-700 
                                hover:border-purple-500 hover:shadow-purple-900/20 hover:shadow-xl transition-all duration-300`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-4 mask-fade-out"></div>
                  </div>
                  
                  {/* Colored gradient overlay - different colors based on position */}
                  <div className={`absolute inset-0 opacity-30 bg-gradient-to-br 
                                  ${isFeatured 
                                    ? 'from-purple-900/40 via-indigo-900/20 to-zinc-900' 
                                    : index % 2 === 0 
                                      ? 'from-blue-900/40 via-indigo-900/20 to-zinc-900'
                                      : 'from-violet-900/40 via-fuchsia-900/20 to-zinc-900'}`}>
                  </div>
                  
                  {/* Featured badge for first item */}
                  {isFeatured && (
                    <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold py-1 px-2 rounded-md shadow-lg transform -rotate-3">
                      Featured
                    </div>
                  )}
                  
                  {/* Logo or image */}
                  <div className="absolute top-4 left-4 z-10">
                    {item.image_url ? (
                      <div className="flex items-center justify-center overflow-hidden bg-zinc-800 rounded-md shadow-md group-hover/item:shadow-purple-900/30 transition-all duration-300"
                           style={{ 
                             width: isFeatured ? '4rem' : '3.5rem', 
                             height: isFeatured ? '4rem' : '3.5rem',
                           }}>
                        <img 
                          src={item.image_url} 
                          alt={`${item.name} logo`}
                          className="max-w-[80%] max-h-[80%] object-contain p-1"
                          onError={(e) => {
                            e.target.parentNode.style.display = 'none';
                            if (e.target.parentNode.nextElementSibling) {
                              e.target.parentNode.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`${isFeatured ? 'w-16 h-16' : 'w-14 h-14'} bg-purple-600 rounded-md flex items-center justify-center text-white font-bold text-2xl shadow-md`}>
                        {item.name ? item.name.substring(0, 1).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* Content with gradient overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-zinc-900/95 via-zinc-900/70 to-transparent">
                    <div className="flex items-center mb-2">
                      <h3 className={`${isFeatured ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} font-bold text-white mr-2 drop-shadow-sm group-hover/item:text-purple-200 transition-colors duration-300`}>
                        {item.name}
                      </h3>
                      {item.official && (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                          Official
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2 group-hover/item:text-gray-200 transition-colors duration-300">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full truncate max-w-[120px]" title={item.category || 'Uncategorized'}>
                        {item.category || 'Uncategorized'}
                      </span>
                      {stars > 0 && (
                        <span className="text-xs text-yellow-400 flex items-center">
                          <span className="mr-1">⭐</span> {starsDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover overlay with button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300 shadow-lg shadow-purple-900/40">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Right arrow (mobile) */}
        <button 
          className={`md:hidden absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-l-lg p-3 z-10 
                    ${canScrollRight ? 'opacity-50 group-hover:opacity-100' : 'opacity-0 pointer-events-none'} 
                    transition-opacity duration-300`}
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Gradient fades on sides to indicate more content */}
        <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-900 to-transparent ${canScrollLeft ? 'opacity-50' : 'opacity-0'} pointer-events-none transition-opacity duration-300`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-900 to-transparent ${canScrollRight ? 'opacity-50' : 'opacity-0'} pointer-events-none transition-opacity duration-300`}></div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;