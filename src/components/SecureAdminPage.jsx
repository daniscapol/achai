import React, { useState, useEffect } from 'react';
import TechHubProductManagementDemo from './TechHubProductManagementDemo';
import NewsAdminPanel from './NewsAdminPanel';
import TutorialAdminPanel from './TutorialAdminPanel';
import { useNavigate } from 'react-router-dom';

const SecureAdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

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
      setMessage('Invalid credentials');
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
          <h1 className="text-3xl font-bold text-gray-200">Secure Admin Area</h1>
          <p className="text-lg text-gray-400 mt-2">Please authenticate to access the admin panel.</p>
        </div>
        
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700 max-w-md mx-auto">
          {message && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
              {message}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-300 font-medium mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter username"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-300 font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter password"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-6 font-semibold rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Login
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
        <h1 className="text-3xl font-bold text-gray-200">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 font-semibold rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Tab selection interface */}
      <div className="mb-6 border-b border-zinc-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 inline-block py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 rounded-t-lg ${
              activeTab === 'products'
                ? 'text-purple-500 border-purple-500'
                : 'text-gray-400 hover:text-white hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('products')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            Product Management
          </button>
          
          <button
            className={`mr-2 inline-block py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 rounded-t-lg ${
              activeTab === 'news'
                ? 'text-purple-500 border-purple-500'
                : 'text-gray-400 hover:text-white hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('news')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M19 20V10m0 0l-3-3m3 3l3-3" />
            </svg>
            News Management
          </button>
          
          <button
            className={`mr-2 inline-block py-4 px-4 text-sm font-medium text-center border-transparent border-b-2 rounded-t-lg ${
              activeTab === 'tutorials'
                ? 'text-purple-500 border-purple-500'
                : 'text-gray-400 hover:text-white hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tutorials')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Tutorials Management
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      {activeTab === 'products' && <TechHubProductManagementDemo />}
      {activeTab === 'news' && <NewsAdminPanel />}
      {activeTab === 'tutorials' && <TutorialAdminPanel />}
    </div>
  );
};

export default SecureAdminPage;