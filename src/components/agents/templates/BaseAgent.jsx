import React, { useState } from 'react';

const BaseAgent = ({ 
  title, 
  description, 
  icon, 
  requiredServices = [], 
  children, 
  onExecute,
  isExecuting = false,
  executionProgress = 0,
  executionStatus = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6 hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg 
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Required Services */}
      <div className="flex flex-wrap gap-2 mb-4">
        {requiredServices.map((service) => (
          <span 
            key={service}
            className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full"
          >
            {service}
          </span>
        ))}
      </div>

      {/* Execution Status */}
      {isExecuting && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Executing...</span>
            <span className="text-sm text-gray-400">{executionProgress}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${executionProgress}%` }}
            />
          </div>
          {executionStatus && (
            <p className="text-sm text-gray-400 mt-2">{executionStatus}</p>
          )}
        </div>
      )}

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          {children}
        </div>
      )}

      {/* Quick Execute Button */}
      {!isExpanded && !isExecuting && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-colors"
        >
          Configure & Run
        </button>
      )}
    </div>
  );
};

export default BaseAgent;