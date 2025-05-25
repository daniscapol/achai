import React, { useState, useEffect } from 'react';
import EmailMarketer from './templates/EmailMarketer';
import SmartEmailAgent from './templates/SmartEmailAgent';
import ReactFlowWorkflowBuilder from './ReactFlowWorkflowBuilder';
import EnhancedWorkflowBuilder from './EnhancedWorkflowBuilder';
import { agentExecutor } from './utils/agentExecutor';
import { workflowEngine } from './utils/workflowEngine';
import { apiKeyManager } from './utils/apiKeyManager';

const AgentRunner = () => {
  const [activeAgent, setActiveAgent] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    // Load execution history and available services
    const agentHistory = agentExecutor.getExecutionHistory();
    const workflowHistory = workflowEngine.getExecutionHistory();
    setExecutionHistory([...agentHistory, ...workflowHistory]);
    setAvailableServices(apiKeyManager.listAvailableServices());
  }, []);

  const agents = [
    {
      id: 'react-flow-builder',
      name: 'React Flow Workflow Builder (NEW)',
      description: 'Professional workflow builder powered by React Flow with ultra-smooth drag & drop, mini-map, and industry-standard performance',
      component: ReactFlowWorkflowBuilder,
      category: 'Professional',
      estimatedTime: '5-15 minutes',
      complexity: 'Professional',
      icon: '🚀',
      featured: true,
      new: true,
      recommended: true
    },
    {
      id: 'workflow-builder',
      name: 'Enhanced Workflow Builder',
      description: 'Custom workflow builder with AI-powered automation, variables, and professional email sequences',
      component: EnhancedWorkflowBuilder,
      category: 'Professional',
      estimatedTime: '10-30 minutes',
      complexity: 'Enterprise',
      icon: '⚡',
      featured: false,
      new: false
    },
    {
      id: 'email-marketer',
      name: 'Email Marketer',
      description: 'Create high-converting email campaigns with AI-generated content, subject lines, and sequences',
      component: EmailMarketer,
      category: 'Marketing',
      estimatedTime: '2-3 minutes',
      complexity: 'Easy',
      icon: '📧'
    },
    {
      id: 'smart-email-workflow',
      name: 'Smart Email Workflow',
      description: 'AI workflow that reads Google Sheets, analyzes contacts, and sends personalized emails automatically',
      component: SmartEmailAgent,
      category: 'Automation',
      estimatedTime: '5-10 minutes',
      complexity: 'Advanced',
      icon: '🔄'
    }
    // More agents will be added here
  ];

  const categories = [...new Set(agents.map(agent => agent.category))];

  const AgentCard = ({ agent }) => (
    <div 
      className={`rounded-lg border p-6 transition-all cursor-pointer hover:shadow-lg relative ${
        agent.featured 
          ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500 hover:border-purple-400' 
          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
      }`}
      onClick={() => setActiveAgent(agent.id)}
    >
      {agent.new && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          NEW
        </div>
      )}
      {agent.featured && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          ⭐ FEATURED
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{agent.icon}</div>
          <div>
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            <p className="text-gray-400 text-sm">{agent.description}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-sm text-gray-400">
          <span>⏱️ {agent.estimatedTime}</span>
          <span>📊 {agent.complexity}</span>
          <span>🏷️ {agent.category}</span>
        </div>
        
        <button className={`px-4 py-2 rounded-lg transition-colors text-sm ${
          agent.featured
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
        }`}>
          Launch
        </button>
      </div>
    </div>
  );

  const StatCard = ({ title, value, description }) => (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );

  if (activeAgent) {
    const agent = agents.find(a => a.id === activeAgent);
    const AgentComponent = agent.component;
    
    // For workflow builder, render without extra wrapper
    if (agent.id === 'workflow-builder') {
      return <AgentComponent onClose={() => setActiveAgent(null)} />;
    }
    
    return (
      <div className="min-h-screen bg-zinc-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveAgent(null)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                <p className="text-gray-400">{agent.description}</p>
              </div>
            </div>
          </div>
          
          <AgentComponent onClose={() => setActiveAgent(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">AI Agent Hub</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful AI agents that use your own API keys. No recurring costs, complete control.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Available Agents" 
            value={agents.length} 
            description="Ready to use"
          />
          <StatCard 
            title="API Services" 
            value={availableServices.length} 
            description="Configured"
          />
          <StatCard 
            title="Executions" 
            value={executionHistory.length} 
            description="Total runs"
          />
          <StatCard 
            title="Success Rate" 
            value={executionHistory.length > 0 ? `${Math.round((executionHistory.filter(h => h.success).length / executionHistory.length) * 100)}%` : '0%'} 
            description="Successful runs"
          />
        </div>

        {/* API Key Management */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.243a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div>
                <span className="text-blue-300 font-medium">API Key Management</span>
                <p className="text-blue-200 text-sm">
                  {availableServices.length > 0 
                    ? `${availableServices.length} API keys configured` 
                    : 'No API keys configured yet'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/agents/keys'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Manage Keys
            </button>
          </div>
        </div>

        {/* Agent Categories */}
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-white mb-4">{category} Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.filter(agent => agent.category === category).map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        {executionHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
              <div className="space-y-0">
                {executionHistory.slice(-5).reverse().map((execution, index) => (
                  <div key={execution.id} className={`p-4 ${index > 0 ? 'border-t border-zinc-700' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${execution.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white font-medium">
                          {agents.find(a => a.id === execution.agentType)?.name || execution.agentType}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {execution.timestamp.toLocaleString()}
                      </span>
                    </div>
                    {!execution.success && execution.error && (
                      <p className="text-red-400 text-sm mt-1 ml-6">{execution.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>🔒 Your API keys are stored securely in your browser and never sent to our servers</p>
        </div>
      </div>
    </div>
  );
};

export default AgentRunner;