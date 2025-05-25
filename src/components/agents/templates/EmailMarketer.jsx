import React, { useState } from 'react';
import BaseAgent from './BaseAgent';
import { apiKeyManager } from '../utils/apiKeyManager';
import { agentExecutor } from '../utils/agentExecutor';

const EmailMarketer = () => {
  const [formData, setFormData] = useState({
    industry: '',
    campaignType: 'promotional',
    targetAudience: '',
    productDescription: '',
    customPrompt: ''
  });
  
  const [apiKeys, setApiKeys] = useState({
    openai: apiKeyManager.getKey('openai') || '',
    mailchimp: apiKeyManager.getKey('mailchimp') || ''
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApiKeyChange = (service, value) => {
    setApiKeys(prev => ({ ...prev, [service]: value }));
  };

  const saveApiKeys = () => {
    // Keys are now automatically loaded from storage, no need to save
    return true;
  };

  const handleExecute = async () => {
    // Validate required fields
    if (!formData.industry || !formData.targetAudience || !formData.productDescription) {
      alert('Please fill in all required fields');
      return;
    }

    if (!apiKeys.openai) {
      alert('OpenAI API key is required');
      return;
    }

    // Save API keys
    if (!saveApiKeys()) {
      return;
    }

    setIsExecuting(true);
    setResult(null);
    
    try {
      const result = await agentExecutor.executeAgent(
        'email-marketer',
        formData,
        (progress, status) => {
          setExecutionProgress(progress);
          setExecutionStatus(status);
        }
      );
      
      setResult(result);
    } catch (error) {
      alert(`Execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
      setExecutionStatus('');
    }
  };

  const campaignTypes = [
    { value: 'promotional', label: 'Promotional Campaign' },
    { value: 'welcome', label: 'Welcome Series' },
    { value: 'nurture', label: 'Lead Nurture' },
    { value: 'retention', label: 'Customer Retention' },
    { value: 'reactivation', label: 'Re-engagement' },
    { value: 'educational', label: 'Educational Content' }
  ];

  const EmailIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  return (
    <BaseAgent
      title="Email Marketer"
      description="Generate high-converting email campaigns with AI"
      icon={<EmailIcon />}
      requiredServices={['OpenAI API']}
      isExecuting={isExecuting}
      executionProgress={executionProgress}
      executionStatus={executionStatus}
    >
      <div className="space-y-6">
        {/* API Keys Status */}
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-white">API Configuration</h4>
            <button
              onClick={() => window.location.href = '/agents/keys'}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Manage Keys
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${apiKeys.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                OpenAI {apiKeys.openai ? '✓' : '✗'}
              </span>
            </div>
          </div>
          
          {!apiKeys.openai && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded">
              <p className="text-red-300 text-sm">
                ⚠️ OpenAI API key required. <a href="/agents/keys" className="underline">Set it up here</a>
              </p>
            </div>
          )}
        </div>

        {/* Campaign Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Campaign Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Industry *
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Type
              </label>
              <select
                value={formData.campaignType}
                onChange={(e) => handleInputChange('campaignType', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {campaignTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Target Audience *
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="e.g., Small business owners, Marketing managers"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product/Service Description *
            </label>
            <textarea
              value={formData.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              placeholder="Describe your product or service, key benefits, pricing..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Additional Requirements
            </label>
            <textarea
              value={formData.customPrompt}
              onChange={(e) => handleInputChange('customPrompt', e.target.value)}
              placeholder="Any specific requirements, tone, call-to-actions, etc."
              rows={2}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          {isExecuting ? 'Generating Campaign...' : 'Generate Email Campaign'}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-zinc-900 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Generated Campaign</h4>
            <div className="bg-zinc-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {result.content}
              </pre>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Generated: {result.metadata.generatedAt.toLocaleString()} | 
              Tokens used: {result.metadata.tokensUsed}
            </div>
          </div>
        )}
      </div>
    </BaseAgent>
  );
};

export default EmailMarketer;