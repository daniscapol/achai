import React, { useEffect } from 'react';
// Temporarily commenting out auth context while it's being implemented
// import { useAuth } from '../../contexts/AuthContext';

// Component to restrict access to authenticated users only
const AuthRequired = ({ children, adminOnly = false }) => {
  // Temporary placeholder for auth context
  const currentUser = null;
  const loading = false;
  const isAdmin = () => false;

  useEffect(() => {
    // Only redirect after auth state is loaded
    if (!loading) {
      if (!currentUser) {
        // Redirect to login if user is not authenticated
        window.location.hash = '#/login';
      } else if (adminOnly && !isAdmin()) {
        // Redirect to home if admin access is required but user is not admin
        window.location.hash = '#/';
      }
    }
  }, [currentUser, loading, adminOnly, isAdmin]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated (and is admin if required), render children
  if (currentUser && (!adminOnly || isAdmin())) {
    return children;
  }

  // Return null while redirecting
  return null;
};

export default AuthRequired;