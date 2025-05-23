import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TechHubProductManagementDemo from './TechHubProductManagementDemo';

const SecureAdminPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  // Only products tab available now

  // Hardcoded credentials as specified
  const validUsername = 'pumba';
  const validPassword = 'Achai328!';

  // Check if user is already authenticated via sessionStorage
  useEffect(() => {
    const authStatus = sessionStorage.getItem('secureAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      setMessage('');
      // Store authentication state in sessionStorage
      sessionStorage.setItem('secureAdminAuthenticated', 'true');
    } else {
      setMessage(t('admin.invalid_credentials'));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    // Remove authentication state from sessionStorage
    sessionStorage.removeItem('secureAdminAuthenticated');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <div className="my-6">
          <h1 className="text-3xl font-bold text-gray-200">{t('admin.secure_admin_area')}</h1>
          <p className="text-lg text-gray-400 mt-2">{t('admin.authenticate_message')}</p>
        </div>
        
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700 max-w-md mx-auto">
          {message && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
              {message}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-300 font-medium mb-2">{t('auth.login.username')}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('admin.enter_username')}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-300 font-medium mb-2">{t('auth.login.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('admin.enter_password')}
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-6 font-semibold rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                {t('auth.login.sign_in')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold text-gray-200">{t('admin.title')}</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 font-semibold rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-200 transition-colors"
        >
          {t('admin.logout')}
        </button>
      </div>
      
      {/* Product Management - Only Available Tab */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          {t('admin.product_management')}
        </h2>
      </div>
      
      {/* Product Management Content */}
      <TechHubProductManagementDemo />
    </div>
  );
};

export default SecureAdminPage;