import React, { useState, useEffect } from 'react';
import { 
  ScrollReveal, 
  EnhancedButton, 
  ParallaxEffect
} from './animations';

const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const getStarClasses = (starIndex) => {
    const filled = starIndex <= (interactive ? hoverRating || rating : rating);
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return `${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-500'} ${interactive ? 'cursor-pointer' : ''} transition-all`;
  };
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <span 
          key={star}
          className="inline-block"
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onChange(star)}
        >
          <svg 
            className={getStarClasses(star)}
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ 
              transform: filled => star <= (interactive && hoverRating ? hoverRating : rating) ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
      ))}
    </div>
  );
};

const ReviewsSection = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newReview, setNewReview] = useState({
    username: '',
    rating: 0,
    title: '',
    comment: '',
    usageDetails: ''
  });
  
  // Fetch reviews from localStorage on component mount
  useEffect(() => {
    const fetchReviews = () => {
      try {
        // Get all reviews from localStorage
        const allReviews = JSON.parse(localStorage.getItem('mcp_reviews') || '{}');
        
        // Get reviews for this specific product
        const productReviews = allReviews[productId] || [];
        
        // Sort reviews by date, newest first
        const sortedReviews = [...productReviews].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate average rating
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = productReviews.length ? totalRating / productReviews.length : 0;
        
        setReviews(sortedReviews);
        setAverageRating(avgRating);
        
        // Set loaded state after a small delay for animation purposes
        setTimeout(() => setIsLoaded(true), 150);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        setAverageRating(0);
        setIsLoaded(true);
      }
    };
    
    fetchReviews();
  }, [productId]);
  
  // Function to handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };
  
  // Function to handle rating change
  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };
  
  // Function to submit a new review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newReview.username.trim() || !newReview.rating || !newReview.comment.trim()) {
      alert("Please fill out all required fields");
      return;
    }
    
    try {
      // Get all existing reviews
      const allReviews = JSON.parse(localStorage.getItem('mcp_reviews') || '{}');
      
      // Get reviews for this product
      const productReviews = allReviews[productId] || [];
      
      // Create new review object
      const reviewToAdd = {
        ...newReview,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productId
      };
      
      // Add new review to the product's reviews
      const updatedProductReviews = [...productReviews, reviewToAdd];
      
      // Update all reviews
      allReviews[productId] = updatedProductReviews;
      
      // Save to localStorage
      localStorage.setItem('mcp_reviews', JSON.stringify(allReviews));
      
      // Update state
      setReviews([reviewToAdd, ...reviews]);
      
      // Recalculate average rating
      const totalRating = updatedProductReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = updatedProductReviews.length ? totalRating / updatedProductReviews.length : 0;
      setAverageRating(avgRating);
      
      // Reset form and close it
      setNewReview({
        username: '',
        rating: 0,
        title: '',
        comment: '',
        usageDetails: ''
      });
      setIsAddingReview(false);
    } catch (error) {
      console.error("Error saving review:", error);
      alert("There was an error saving your review. Please try again.");
    }
  };
  
  // Generate sample reviews if none exist
  const generateSampleReviews = () => {
    const sampleReviews = [
      {
        id: 's1',
        username: 'DeveloperAI',
        rating: 5,
        title: 'Game-changing for our development workflow',
        comment: 'This MCP server has completely transformed how our team interacts with AI models. Integration was seamless and the performance is exceptional.',
        usageDetails: 'Using with Claude for code assistance',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        productId
      },
      {
        id: 's2',
        username: 'DataScientist42',
        rating: 4,
        title: 'Great for data processing workflows',
        comment: 'Very impressed with how this MCP server handles our large datasets. The only minor issue is occasional latency with very large requests.',
        usageDetails: 'Research data analysis pipeline',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        productId
      },
      {
        id: 's3',
        username: 'AIEnthusiast',
        rating: 5,
        title: 'Exactly what I was looking for',
        comment: 'This server fits perfectly into my existing workflow. Documentation is excellent and support has been very responsive.',
        usageDetails: 'Personal project with multiple AI models',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        productId
      }
    ];
    
    try {
      // Get all existing reviews
      const allReviews = JSON.parse(localStorage.getItem('mcp_reviews') || '{}');
      
      // Add sample reviews for this product
      allReviews[productId] = sampleReviews;
      
      // Save to localStorage
      localStorage.setItem('mcp_reviews', JSON.stringify(allReviews));
      
      // Update state
      setReviews(sampleReviews);
      setAverageRating(4.67); // (5+4+5)/3
    } catch (error) {
      console.error("Error generating sample reviews:", error);
    }
  };
  
  return (
    <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700 mt-8 transition-all hover:border-zinc-600">
      <ScrollReveal direction="down" duration="fast">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">User Reviews</h2>
      </ScrollReveal>
      
      {/* Reviews Summary */}
      <div className="flex flex-col md:flex-row items-start mb-8 gap-6">
        <ScrollReveal direction="left" delay={150} duration="normal" className="md:w-1/3 w-full">
          <ParallaxEffect depth={2} glare={false} className="h-full">
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 transition-all hover:shadow-xl w-full h-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-100 mb-2 transition-all hover:scale-110 hover:text-purple-400 duration-300">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2 transition-all hover:scale-105 duration-200">
                  <StarRating rating={averageRating} size="lg" />
                </div>
                <div className="text-gray-400 text-sm"
                  style={{ 
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    transitionDelay: '300ms'
                  }}
                >
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>
              
              {/* Rating Breakdown - For demonstration purposes */}
              {reviews.length > 0 && (
                <div className="mt-6"
                  style={{ 
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    transitionDelay: '400ms'
                  }}
                >
                  <h3 className="text-gray-300 font-medium mb-3">Rating Breakdown</h3>
                  {[5, 4, 3, 2, 1].map((star, index) => {
                    const count = reviews.filter(review => review.rating === star).length;
                    const percentage = reviews.length ? (count / reviews.length * 100) : 0;
                    
                    return (
                      <div key={star} className="flex items-center mb-2"
                        style={{ 
                          opacity: isLoaded ? 1 : 0,
                          transform: isLoaded ? 'translateX(0)' : 'translateX(-10px)',
                          transition: 'opacity 0.3s ease, transform 0.3s ease',
                          transitionDelay: `${400 + (index * 50)}ms`
                        }}
                      >
                        <div className="text-sm text-gray-400 w-6">{star}</div>
                        <svg className="h-4 w-4 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="w-full h-2 bg-zinc-700 rounded ml-2 overflow-hidden">
                          <div 
                            className="h-2 bg-purple-600 rounded transition-all duration-1000 ease-out" 
                            style={{ 
                              width: isLoaded ? `${percentage}%` : '0%'
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-400 ml-2 w-6">{count}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ParallaxEffect>
        </ScrollReveal>
        
        <ScrollReveal direction="right" delay={200} duration="normal" className="flex-grow">
          <div className="w-full">
            {/* Add Review Button */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-100">
                {reviews.length > 0 ? 'User Feedback' : 'Be the first to leave a review'}
              </h3>
              <EnhancedButton 
                onClick={() => setIsAddingReview(true)}
                variant="primary"
              >
                Write a Review
              </EnhancedButton>
            </div>
            
            {/* Empty State */}
            {reviews.length === 0 && (
              <ScrollReveal direction="up" delay={300} duration="normal">
                <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 text-center transition-all hover:shadow-xl hover:border-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-400 mb-4">There are no reviews for this MCP server yet.</p>
                  <div className="flex justify-center gap-4">
                    <EnhancedButton 
                      onClick={generateSampleReviews}
                      variant="text"
                      className="text-purple-400"
                    >
                      Generate Sample Reviews
                    </EnhancedButton>
                  </div>
                </div>
              </ScrollReveal>
            )}
            
            {/* Review List */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <ScrollReveal 
                    key={review.id} 
                    direction="up" 
                    delay={300 + (index * 100)} 
                    duration="fast"
                    once={true}
                  >
                    <ParallaxEffect depth={1} className="w-full">
                      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 transition-all hover:shadow-lg hover:border-zinc-600 w-full">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium text-gray-200">{review.title || `Review of ${productName}`}</div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <div className="flex items-center mb-3">
                          <div className="text-sm text-gray-400">
                            By {review.username} • {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-2">{review.comment}</p>
                        {review.usageDetails && (
                          <div className="text-sm text-gray-400 mt-2 italic">Use case: {review.usageDetails}</div>
                        )}
                      </div>
                    </ParallaxEffect>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
      
      {/* Add Review Form */}
      {isAddingReview && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div 
            className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 max-w-xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              animation: 'scaleIn 0.3s ease-out',
              transformOrigin: 'center'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-100">Write a Review</h3>
              <button 
                className="text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-zinc-700 p-1"
                onClick={() => setIsAddingReview(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview}>
              {/* Username */}
              <div className="mb-4 animate-fadeIn" style={{ animationDelay: '50ms' }}>
                <label className="block text-gray-300 mb-2">Your Name <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="username"
                  value={newReview.username}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>
              
              {/* Rating */}
              <div className="mb-4 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <label className="block text-gray-300 mb-2">Rating <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <StarRating 
                    rating={newReview.rating} 
                    interactive={true} 
                    onChange={handleRatingChange}
                    size="lg"
                  />
                  <span className="ml-2 text-gray-400">
                    {newReview.rating > 0 ? `${newReview.rating} ${newReview.rating === 1 ? 'Star' : 'Stars'}` : 'Select a rating'}
                  </span>
                </div>
              </div>
              
              {/* Review Title */}
              <div className="mb-4 animate-fadeIn" style={{ animationDelay: '150ms' }}>
                <label className="block text-gray-300 mb-2">Review Title</label>
                <input 
                  type="text"
                  name="title"
                  value={newReview.title}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all"
                  placeholder="Summarize your experience (optional)"
                />
              </div>
              
              {/* Review Comment */}
              <div className="mb-4 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                <label className="block text-gray-300 mb-2">Review <span className="text-red-500">*</span></label>
                <textarea 
                  name="comment"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all min-h-[100px]"
                  required
                  placeholder="Share your experience with this MCP server..."
                ></textarea>
              </div>
              
              {/* Usage Details */}
              <div className="mb-6 animate-fadeIn" style={{ animationDelay: '250ms' }}>
                <label className="block text-gray-300 mb-2">How are you using this MCP server?</label>
                <input 
                  type="text"
                  name="usageDetails"
                  value={newReview.usageDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all"
                  placeholder="e.g. With Claude for document processing (optional)"
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                <EnhancedButton
                  onClick={() => setIsAddingReview(false)}
                  variant="secondary"
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton 
                  type="submit"
                  variant="primary"
                  disabled={!newReview.username || !newReview.rating || !newReview.comment}
                >
                  Submit Review
                </EnhancedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;