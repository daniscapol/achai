import React, { useState } from 'react';
// Temporarily commenting out auth context while it's being implemented
// import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Temporary placeholder for auth context
  const register = async () => {
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.reject({ message: "Registration system is under construction" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(username, email, password);
      setSuccess('Account created successfully! Redirecting...');
      // Redirect to home page after successful registration
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-md mx-auto bg-zinc-800/60 rounded-xl p-8 border border-zinc-700 shadow-lg mt-10">
        <div className="flex flex-col items-center mb-6">
          <img src="/assets/logo.png" alt="AchAI Logo" className="h-20 w-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-100 text-center">Create Account</h1>
        </div>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="username">
              Username
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
              Email
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
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters long</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a href="#/login" className="text-purple-400 hover:text-purple-300">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;