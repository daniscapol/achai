import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Settings, CheckCircle, Loader, AlertCircle, Clock } from 'lucide-react';

const CustomWorkflowNode = ({ id, data, isConnectable }) => {
  const { label, stepType, config, status, onDelete, onSelect } = data;

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBorder = () => {
    switch (status) {
      case 'running':
        return 'border-blue-500 shadow-blue-200';
      case 'completed':
        return 'border-green-500 shadow-green-200';
      case 'error':
        return 'border-red-500 shadow-red-200';
      default:
        return 'border-gray-300 hover:border-gray-400';
    }
  };

  return (
    <div 
      className={`custom-workflow-node bg-white rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer ${getStatusBorder()}`}
      onClick={() => onSelect && onSelect(data, id)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: stepType?.color || '#6B7280',
          width: '16px',
          height: '16px',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        isConnectable={isConnectable}
      />

      {/* Node Content */}
      <div className="p-4 min-w-[200px]">
        {/* Header with drag handle */}
        <div 
          className="custom-drag-handle flex items-center justify-between mb-2 cursor-move hover:bg-gray-50 rounded p-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-lg">{stepType?.icon || '🔧'}</span>
            <span className="font-semibold text-gray-900 text-sm">{label}</span>
            <span className="text-xs text-gray-400 opacity-60">✋ drag</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(data, id);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors nodrag"
              title="Configure"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors nodrag"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Step Type Badge */}
        <div 
          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
          style={{ backgroundColor: stepType?.color || '#6B7280' }}
        >
          {stepType?.name || 'Unknown Step'}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          {stepType?.description || 'No description available'}
        </p>

        {/* Input/Output Indicators */}
        <div className="flex justify-between text-xs">
          <div className="text-green-600">
            <strong>Inputs:</strong> {stepType?.inputs?.join(', ') || 'None'}
          </div>
          <div className="text-blue-600">
            <strong>Outputs:</strong> {stepType?.outputs?.join(', ') || 'None'}
          </div>
        </div>

        {/* Configuration Preview */}
        {config && Object.keys(config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              <strong>Configured:</strong> {Object.keys(config).length} setting(s)
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${
              status === 'completed' ? 'text-green-600' :
              status === 'running' ? 'text-blue-600' :
              status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: stepType?.color || '#6B7280',
          width: '16px',
          height: '16px',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomWorkflowNode);