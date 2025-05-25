import React, { useState } from 'react';
import BaseAgent from './BaseAgent';
import { apiKeyManager } from '../utils/apiKeyManager';
import { workflowEngine } from '../utils/workflowEngine';

const SmartEmailAgent = () => {
  const [formData, setFormData] = useState({
    sheetId: '',
    campaignType: 'nurture',
    emailService: 'resend',
    customRules: ''
  });
  
  const [apiKeys, setApiKeys] = useState({
    openai: apiKeyManager.getKey('openai') || '',
    google_api_key: apiKeyManager.getKey('google_api_key') || '',
    resend: apiKeyManager.getKey('resend') || ''
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState('');
  const [result, setResult] = useState(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

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

  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleExecute = async () => {
    // Validate required fields
    if (!formData.sheetId) {
      alert('Please provide a Google Sheet ID or URL');
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
      const workflowConfig = {
        ...formData,
        sheetId: extractSheetId(formData.sheetId)
      };
      
      const result = await workflowEngine.executeWorkflow(
        workflowConfig,
        (progress, status) => {
          setExecutionProgress(progress);
          setExecutionStatus(status);
        }
      );
      
      setResult(result);
    } catch (error) {
      alert(`Workflow failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
      setExecutionStatus('');
    }
  };

  const campaignTypes = [
    { value: 'nurture', label: 'Lead Nurture - Build relationships' },
    { value: 'sales', label: 'Sales Outreach - Convert prospects' },
    { value: 'reactivation', label: 'Re-engagement - Win back customers' },
    { value: 'educational', label: 'Educational - Share insights' },
    { value: 'promotional', label: 'Promotional - Announce offers' }
  ];

  const emailServices = [
    { value: 'simulate', label: '🧪 Simulate Only (Testing)', description: 'No emails sent, just testing' },
    { value: 'resend', label: '✉️ Resend.com (Recommended)', description: 'Easy setup, great for developers' },
    { value: 'mailgun', label: '🚀 Mailgun', description: 'Reliable, good free tier' },
    { value: 'sendgrid', label: '📧 SendGrid', description: 'Popular choice' },
    { value: 'gmail', label: '📮 Gmail API', description: 'Use your Gmail account' },
    { value: 'outlook', label: '📨 Outlook/Microsoft', description: 'Microsoft Graph API' }
  ];

  const WorkflowIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  return (
    <BaseAgent
      title="Smart Email Workflow"
      description="AI agent that reads Google Sheets, analyzes contacts, and sends personalized emails"
      icon={<WorkflowIcon />}
      requiredServices={['OpenAI API', 'Google Sheets API', 'Email Service']}
      isExecuting={isExecuting}
      executionProgress={executionProgress}
      executionStatus={executionStatus}
    >
      <div className="space-y-6">
        {/* Setup Guide Toggle */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300 font-medium">Need help setting up?</span>
            </div>
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showSetupGuide ? 'Hide Guide' : 'Show Setup Guide'}
            </button>
          </div>
          
          {showSetupGuide && (
            <div className="mt-4 space-y-3 text-sm text-blue-200">
              <div>
                <h5 className="font-medium text-blue-100 mb-1">📊 Google Sheet Setup:</h5>
                <p>Create a sheet with columns: Email, Name, Company, Industry, Status, Pain_Points, Budget_Range</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-100 mb-1">🔑 Google Sheet Access:</h5>
                <p><strong>Easy way:</strong> Make your Google Sheet public (Share → Anyone with link can view)</p>
                <p><strong>Private sheet:</strong> Get Google API key from Google Cloud Console</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-100 mb-1">📧 Email Service Options:</h5>
                <p><strong>Resend.com:</strong> Sign up at resend.com → API Keys (easiest setup)</p>
                <p><strong>Mailgun:</strong> Get free account at mailgun.com → API Keys</p>
                <p><strong>Gmail:</strong> Use Google Cloud Console OAuth2 setup</p>
                <p><strong>Test Mode:</strong> Use "Simulate Only" to test without sending</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-100 mb-1">🔐 Sheet Sharing:</h5>
                <p>Click "Share" on your Google Sheet → "Anyone with the link" → "Viewer"</p>
                <p>This allows the agent to read your data without authentication</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Email Notice */}
        {formData.emailService !== 'simulate' && (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-300 font-medium">Live Email Sending Enabled</span>
            </div>
            <p className="text-green-200 mt-1">
              🚀 <strong>LIVE MODE:</strong> This will send real emails to the contacts in your Google Sheet! 
              Make sure your contact data is correct.
            </p>
          </div>
        )}

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${apiKeys.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                OpenAI {apiKeys.openai ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${apiKeys.resend ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-sm text-gray-300">
                Resend {apiKeys.resend ? '✓' : '○'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${apiKeys.google_api_key ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-sm text-gray-300">
                Google {apiKeys.google_api_key ? '✓' : '○'}
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

        {/* Workflow Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Workflow Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Google Sheet ID or URL *
            </label>
            <input
              type="text"
              value={formData.sheetId}
              onChange={(e) => handleInputChange('sheetId', e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/SHEET_ID/edit or just SHEET_ID"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your sheet should have columns: Email, Name, Company, Industry, Status, Pain_Points, Budget_Range
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Service
              </label>
              <select
                value={formData.emailService}
                onChange={(e) => handleInputChange('emailService', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {emailServices.map(service => (
                  <option key={service.value} value={service.value} title={service.description}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custom Rules & Instructions
            </label>
            <textarea
              value={formData.customRules}
              onChange={(e) => handleInputChange('customRules', e.target.value)}
              placeholder="e.g., 'Mention our Black Friday sale', 'Use casual tone for startups', 'Don't contact on Fridays'"
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
          {isExecuting ? 'Running Workflow...' : 'Start Smart Email Workflow'}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-zinc-900 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Workflow Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{result.contactsProcessed}</div>
                <div className="text-sm text-gray-400">Contacts Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{result.emailsSent}</div>
                <div className="text-sm text-gray-400">Emails Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{result.errors}</div>
                <div className="text-sm text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((result.emailsSent / result.contactsProcessed) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Detailed Results:</h5>
              {result.results.map((res, index) => (
                <div key={index} className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                  <span className={res.success ? 'text-green-400' : 'text-red-400'}>
                    {res.success ? '✓' : '✗'}
                  </span>
                  <span>{res.contact.email}</span>
                  <span>{res.success ? `Sent: "${res.subject}"` : `Failed: ${res.reason || res.error}`}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Workflow completed: {result.timestamp.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </BaseAgent>
  );
};

export default SmartEmailAgent;