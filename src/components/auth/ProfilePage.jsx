import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Temporarily commenting out auth context while it's being implemented
// import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { t } = useTranslation();
  // Temporary placeholder for auth context
  const currentUser = null;
  const updateProfile = async () => Promise.reject({ message: "Profile update is under construction" });
  const logout = () => {};
  const getFavorites = () => [];
  const isAdmin = () => false;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  
  // Set initial form values from current user
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);
  
  // Load favorite MCP servers
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favoriteIds = getFavorites();
        const allServers = JSON.parse(localStorage.getItem('mcp_servers_data') || '[]');
        
        // Find servers that match the favorite IDs
        const favoriteServers = allServers.filter(server => favoriteIds.includes(server.id));
        setFavorites(favoriteServers);
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    };
    
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser, getFavorites]);
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate password if changing
    if (newPassword) {
      if (newPassword.length < 6) {
        setError(t('forms.password_min', { min: 6 }));
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError(t('forms.password_mismatch'));
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Create update object with only changed fields
      const updates = {
        username,
        email
      };
      
      if (newPassword) {
        updates.password = newPassword;
      }
      
      await updateProfile(updates);
      setSuccess(t('auth.profile.success_message'));
      
      // Clear password fields after update
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || t('auth.profile.error_message'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.hash = '#/';
  };
  
  // Navigate to server detail
  const navigateToServer = (serverId) => {
    window.location.hash = `#/products/${serverId}`;
  };
  
  // Navigate to admin page
  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
  };
  
  // Redirect if user is not logged in
  if (!currentUser) {
    window.location.hash = '#/login';
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">{t('auth.profile.title')}</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-zinc-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'profile'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            {t('auth.profile.profile_settings')}
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'favorites'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            {t('auth.profile.my_favorites')}
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'submissions'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('submissions')}
          >
            {t('profile.tabs.submissions')}
          </button>
          {isAdmin() && (
            <button
              className="ml-auto py-2 px-4 font-medium text-green-400 hover:text-green-300"
              onClick={navigateToAdmin}
            >
              {t('profile.admin_panel')}
            </button>
          )}
        </div>
        
        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">{t('profile.edit_profile')}</h2>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4" role="alert">
                <p>{success}</p>
              </div>
            )}
            
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="username">
                  {t('auth.profile.username')}
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="email">
                  {t('auth.profile.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="new-password">
                  {t('auth.profile.new_password')}
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {newPassword && (
                  <p className="text-xs text-gray-400 mt-1">{t('auth.profile.password_requirement')}</p>
                )}
              </div>
              
              {newPassword && (
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2" htmlFor="confirm-password">
                    {t('auth.profile.confirm_password')}
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.saving') : t('auth.profile.save_changes')}
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-bold py-2 px-6 rounded-md transition-colors duration-300"
                >
                  {t('auth.logout')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">{t('profile.favorites.title')}</h2>
            
            {favorites.length === 0 ? (
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-400 text-lg mb-3">{t('profile.favorites.empty_message')}</p>
                <a href="#/" className="text-purple-400 hover:text-purple-300">
                  {t('profile.favorites.browse_message')}
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map(server => (
                  <div
                    key={server.id}
                    className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex items-center cursor-pointer hover:border-purple-500 transition-colors duration-300"
                    onClick={() => navigateToServer(server.id)}
                  >
                    {server.image_url ? (
                      <img
                        src={server.image_url}
                        alt={`${server.name} logo`}
                        className="w-12 h-12 rounded-md mr-4 object-contain bg-zinc-800/80 p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-600 rounded-md mr-4 flex items-center justify-center text-white font-bold text-lg">
                        {server.name ? server.name.substring(0, 1).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-200">{server.name}</h3>
                      <p className="text-sm text-gray-400 truncate max-w-xs">{server.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">{t('profile.submissions.title')}</h2>
            
            <div className="flex justify-between mb-4">
              <p className="text-gray-400">{t('profile.submissions.description')}</p>
              <a
                href="#/submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-300"
              >
                {t('profile.submissions.submit_new')}
              </a>
            </div>
            
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg mb-3">{t('profile.submissions.empty_message')}</p>
              <a href="#/submit" className="text-purple-400 hover:text-purple-300">
                {t('profile.submissions.submit_first')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;