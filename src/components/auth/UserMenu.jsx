import React, { useState, useRef, useEffect } from 'react';
// Temporarily commenting out auth context while it's being implemented
// import { useAuth } from '../../contexts/AuthContext';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  // Temporary placeholder for auth context
  const currentUser = null;
  const logout = () => {};
  const isAdmin = () => false;

  // Handle clicks outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.hash = '#/';
    setIsOpen(false);
  };

  // Navigate to profile
  const navigateToProfile = () => {
    window.location.hash = '#/profile';
    setIsOpen(false);
  };

  // Navigate to admin panel
  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
    setIsOpen(false);
  };

  // If not logged in, show login/register buttons
  if (!currentUser) {
    return (
      <div className="flex items-center space-x-3">
        <a 
          href="#/login" 
          className="text-gray-200 hover:text-purple-400 transition-colors"
        >
          Login
        </a>
        <a 
          href="#/register" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Register
        </a>
      </div>
    );
  }

  // If logged in, show user dropdown menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center text-gray-200 hover:text-purple-400 focus:outline-none transition-colors"
      >
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-2">
          {currentUser.username.substring(0, 1).toUpperCase()}
        </div>
        <span className="hidden md:inline-block">{currentUser.username}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 ml-1 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 py-1 animate-fadeIn">
          <div className="px-4 py-2 border-b border-zinc-700">
            <p className="text-sm font-medium text-gray-200">{currentUser.username}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
          </div>
          
          <a
            href="#/profile"
            onClick={navigateToProfile}
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </span>
          </a>
          
          <a
            href="#/favorites"
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              My Favorites
            </span>
          </a>
          
          <a
            href="#/submit"
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Server
            </span>
          </a>
          
          {isAdmin() && (
            <a
              href="#/admin"
              onClick={navigateToAdmin}
              className="block px-4 py-2 text-sm text-green-400 hover:bg-zinc-700 hover:text-green-300"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </span>
            </a>
          )}
          
          <div className="border-t border-zinc-700 mt-1">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;