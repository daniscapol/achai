import React, { useState, useEffect } from 'react';
// Temporarily commenting out auth context while it's being implemented
// import { useAuth } from '../contexts/AuthContext';

const FavoriteButton = ({ productId }) => {
  // Temporary placeholder for auth context
  const currentUser = null;
  const isFavorite = () => false;
  const toggleFavorite = () => false;
  const [favorite, setFavorite] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Check if product is favorited on mount and when current user changes
  useEffect(() => {
    if (currentUser) {
      setFavorite(isFavorite(productId));
    } else {
      setFavorite(false);
    }
  }, [currentUser, productId, isFavorite]);

  // Handle favorite toggle
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      // Redirect to login if not logged in
      window.location.hash = '#/login';
      return;
    }
    
    try {
      const newFavoriteStatus = toggleFavorite(productId);
      setFavorite(newFavoriteStatus);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={handleToggleFavorite}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="p-2 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
        title="Login to favorite"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`p-2 rounded-full transition-colors ${
        favorite
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
      }`}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${favorite ? 'text-white' : isHovering ? 'text-purple-400' : 'text-gray-400'}`}
        fill={favorite ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
};

export default FavoriteButton;