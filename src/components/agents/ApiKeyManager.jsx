import React, { useState, useEffect } from 'react';
import { apiKeyManager } from './utils/apiKeyManager';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    resend: '',
    google_api_key: '',
    sendgrid: '',
    mailgun: '',
    mailgun_domain: ''
  });
  
  const [showKeys, setShowKeys] = useState({});
  const [savedStatus, setSavedStatus] = useState({});

  useEffect(() => {
    // Load saved keys on component mount
    const loadedKeys = {};
    Object.keys(apiKeys).forEach(service => {
      const savedKey = apiKeyManager.getKey(service);
      if (savedKey) {
        loadedKeys[service] = savedKey;
      }
    });
    setApiKeys(prev => ({ ...prev, ...loadedKeys }));
  }, []);

  const handleKeyChange = (service, value) => {
    setApiKeys(prev => ({ ...prev, [service]: value }));
    
    // Clear saved status when user types
    setSavedStatus(prev => ({ ...prev, [service]: null }));
  };

  const saveKey = (service) => {
    const key = apiKeys[service];
    
    if (!key || key.trim() === '') {
      setSavedStatus(prev => ({ ...prev, [service]: 'empty' }));
      setTimeout(() => setSavedStatus(prev => ({ ...prev, [service]: null })), 2000);
      return;
    }

    try {
      // Validate key format
      if (service === 'openai' && !key.startsWith('sk-')) {
        throw new Error('OpenAI API key should start with "sk-"');
      }
      if (service === 'resend' && !key.startsWith('re_')) {
        throw new Error('Resend API key should start with "re_"');
      }
      if (service === 'sendgrid' && !key.startsWith('SG.')) {
        throw new Error('SendGrid API key should start with "SG."');
      }

      // Save to localStorage
      apiKeyManager.storeKey(service, key, true);
      setSavedStatus(prev => ({ ...prev, [service]: 'success' }));
      
      // Clear success status after 2 seconds
      setTimeout(() => setSavedStatus(prev => ({ ...prev, [service]: null })), 2000);
      
    } catch (error) {
      setSavedStatus(prev => ({ ...prev, [service]: 'error' }));
      console.error(`Error saving ${service} key:`, error.message);
      setTimeout(() => setSavedStatus(prev => ({ ...prev, [service]: null })), 3000);
    }
  };

  const deleteKey = (service) => {
    apiKeyManager.removeKey(service);
    setApiKeys(prev => ({ ...prev, [service]: '' }));
    setSavedStatus(prev => ({ ...prev, [service]: 'deleted' }));
    setTimeout(() => setSavedStatus(prev => ({ ...prev, [service]: null })), 2000);
  };

  const clearAllKeys = () => {
    if (confirm('Are you sure you want to clear all saved API keys? This cannot be undone.')) {
      apiKeyManager.clearAllKeys();
      setApiKeys({
        openai: '',
        resend: '',
        google_api_key: '',
        sendgrid: '',
        mailgun: '',
        mailgun_domain: ''
      });
      setSavedStatus({});
      alert('All API keys have been cleared.');
    }
  };

  const toggleShowKey = (service) => {
    setShowKeys(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <span className="text-green-400">✓</span>;
      case 'error':
        return <span className="text-red-400">✗</span>;
      case 'deleted':
        return <span className="text-yellow-400">🗑️</span>;
      case 'empty':
        return <span className="text-orange-400">⚠️</span>;
      default:
        return null;
    }
  };

  const keyConfigs = [
    {
      service: 'openai',
      label: 'OpenAI API Key',
      placeholder: 'sk-...',
      required: true,
      description: 'For AI content generation and analysis'
    },
    {
      service: 'resend',
      label: 'Resend API Key',
      placeholder: 're_...',
      required: false,
      description: 'For sending emails (recommended)'
    },
    {
      service: 'google_api_key',
      label: 'Google API Key',
      placeholder: 'AIza...',
      required: false,
      description: 'For private Google Sheets access'
    },
    {
      service: 'sendgrid',
      label: 'SendGrid API Key',
      placeholder: 'SG...',
      required: false,
      description: 'Alternative email service'
    },
    {
      service: 'mailgun',
      label: 'Mailgun API Key',
      placeholder: 'key-...',
      required: false,
      description: 'Alternative email service'
    },
    {
      service: 'mailgun_domain',
      label: 'Mailgun Domain',
      placeholder: 'sandbox123.mailgun.org',
      required: false,
      description: 'Your Mailgun domain'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🔑 API Key Manager</h1>
          <p className="text-xl text-gray-400">
            Save your API keys securely in your browser for easy access across all agents
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-blue-300 font-medium">Secure Storage</span>
          </div>
          <p className="text-blue-200 mt-1">
            Your API keys are stored securely in your browser's localStorage. They never leave your device and are not sent to our servers.
          </p>
        </div>

        {/* API Keys List */}
        <div className="space-y-6">
          {keyConfigs.map(({ service, label, placeholder, required, description }) => (
            <div key={service} className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {label} {required && <span className="text-red-400">*</span>}
                  </h3>
                  <p className="text-sm text-gray-400">{description}</p>
                </div>
                {getStatusIcon(savedStatus[service])}
              </div>

              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type={showKeys[service] ? 'text' : 'password'}
                    value={apiKeys[service]}
                    onChange={(e) => handleKeyChange(service, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                  />
                  <button
                    onClick={() => toggleShowKey(service)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys[service] ? '🙈' : '👁️'}
                  </button>
                </div>
                
                <button
                  onClick={() => saveKey(service)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                
                {apiKeys[service] && (
                  <button
                    onClick={() => deleteKey(service)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>

              {savedStatus[service] === 'success' && (
                <p className="text-green-400 text-sm mt-2">✓ Saved successfully</p>
              )}
              {savedStatus[service] === 'error' && (
                <p className="text-red-400 text-sm mt-2">✗ Invalid key format</p>
              )}
              {savedStatus[service] === 'deleted' && (
                <p className="text-yellow-400 text-sm mt-2">🗑️ Key deleted</p>
              )}
              {savedStatus[service] === 'empty' && (
                <p className="text-orange-400 text-sm mt-2">⚠️ Key cannot be empty</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => window.location.href = '/agents'}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Agents
          </button>
          
          <button
            onClick={clearAllKeys}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Clear All Keys
          </button>
        </div>

        {/* Quick Setup Guide */}
        <div className="mt-12 bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Quick Setup Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">OpenAI (Required)</h3>
              <p>1. Go to platform.openai.com</p>
              <p>2. Create API key</p>
              <p>3. Add $5+ credit to your account</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Resend (Recommended)</h3>
              <p>1. Sign up at resend.com</p>
              <p>2. Go to API Keys → Create</p>
              <p>3. Free tier: 3,000 emails/month</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Google Sheets (Optional)</h3>
              <p>1. Go to Google Cloud Console</p>
              <p>2. Enable Sheets API</p>
              <p>3. Create API key</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Tips</h3>
              <p>• Keys are saved in your browser</p>
              <p>• No server storage for security</p>
              <p>• Only set up what you need</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;