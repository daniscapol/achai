import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('mcp_current_user');
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
      setError('Failed to load user session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new user
  const register = async (username, email, password) => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('mcp_users') || '[]');
      if (existingUsers.some(user => user.email === email)) {
        throw new Error('Email already in use');
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In a real app, we'd hash this password, but for demo we'll store plaintext
        createdAt: new Date().toISOString(),
        favorites: [],
        submissions: [],
        isAdmin: false
      };

      // Add to users array
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('mcp_users', JSON.stringify(updatedUsers));

      // Set as current user
      setCurrentUser({ ...newUser, password: undefined }); // Don't include password in current user object
      localStorage.setItem('mcp_current_user', JSON.stringify({ ...newUser, password: undefined }));

      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('mcp_users') || '[]');
      const user = users.find(user => user.email === email && user.password === password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Set as current user
      setCurrentUser({ ...user, password: undefined }); // Don't include password in current user object
      localStorage.setItem('mcp_current_user', JSON.stringify({ ...user, password: undefined }));

      return user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mcp_current_user');
  };

  // Toggle favorite status for a server
  const toggleFavorite = (serverId) => {
    if (!currentUser) return;

    try {
      // Get users array from storage
      const users = JSON.parse(localStorage.getItem('mcp_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Toggle favorite status
      const favorites = users[userIndex].favorites || [];
      const isFavorite = favorites.includes(serverId);

      if (isFavorite) {
        // Remove from favorites
        users[userIndex].favorites = favorites.filter(id => id !== serverId);
      } else {
        // Add to favorites
        users[userIndex].favorites = [...favorites, serverId];
      }

      // Update localStorage and state
      localStorage.setItem('mcp_users', JSON.stringify(users));
      const updatedUser = { ...users[userIndex], password: undefined };
      setCurrentUser(updatedUser);
      localStorage.setItem('mcp_current_user', JSON.stringify(updatedUser));

      return !isFavorite; // Return new favorite status
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorites');
      throw err;
    }
  };

  // Check if a server is favorited
  const isFavorite = (serverId) => {
    if (!currentUser || !currentUser.favorites) return false;
    return currentUser.favorites.includes(serverId);
  };

  // Get user favorites
  const getFavorites = () => {
    return currentUser?.favorites || [];
  };

  // Update user profile
  const updateProfile = (updates) => {
    if (!currentUser) return;

    try {
      // Get users array from storage
      const users = JSON.parse(localStorage.getItem('mcp_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user data
      const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Don't allow changing email to one that's already in use
      if (updates.email && updates.email !== users[userIndex].email) {
        const emailInUse = users.some((u, i) => i !== userIndex && u.email === updates.email);
        if (emailInUse) {
          throw new Error('Email already in use');
        }
      }

      users[userIndex] = updatedUser;

      // Update localStorage and state
      localStorage.setItem('mcp_users', JSON.stringify(users));
      setCurrentUser({ ...updatedUser, password: undefined });
      localStorage.setItem('mcp_current_user', JSON.stringify({ ...updatedUser, password: undefined }));

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Check if user has admin rights
  const isAdmin = () => {
    return currentUser?.isAdmin === true;
  };

  // Value object to be provided by the context
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    toggleFavorite,
    isFavorite,
    getFavorites,
    updateProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;