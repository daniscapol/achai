import React, { useState, useRef, useCallback } from 'react';
import { Plus, Play, Save, Settings, Zap, Mail, Database, GitBranch, Bot, Eye, FileText, X } from 'lucide-react';
import { WorkflowEngine } from './utils/advancedWorkflowEngine.js';
import WorkflowTemplates from './templates/WorkflowTemplates.jsx';

const WorkflowBuilder = ({ onClose }) => {
  const [workflow, setWorkflow] = useState({
    id: null,
    name: 'Untitled Workflow',
    description: 'Professional AI-powered automation',
    variables: {},
    steps: [],
    triggers: [],
    connections: []
  });
  
  const [selectedStep, setSelectedStep] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const canvasRef = useRef(null);

  const stepTypes = [
    {
      id: 'data_source',
      name: 'Data Source',
      icon: Database,
      color: 'bg-blue-500',
      description: 'Import data from Google Sheets, CSV, or API',
      inputs: ['sheet_url', 'api_endpoint', 'csv_file'],
      outputs: ['contacts', 'data']
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      icon: Bot,
      color: 'bg-purple-500',
      description: 'Analyze data with GPT-4 for insights and segmentation',
      inputs: ['data', 'analysis_prompt'],
      outputs: ['analyzed_data', 'segments', 'insights']
    },
    {
      id: 'ai_content',
      name: 'AI Content Generation',
      icon: Zap,
      color: 'bg-green-500',
      description: 'Generate personalized content with AI',
      inputs: ['data', 'template', 'brand_voice'],
      outputs: ['content', 'subject_lines', 'variations']
    },
    {
      id: 'condition',
      name: 'Smart Condition',
      icon: GitBranch,
      color: 'bg-yellow-500',
      description: 'AI-powered decision branching',
      inputs: ['data', 'condition_logic'],
      outputs: ['true_path', 'false_path', 'maybe_path']
    },
    {
      id: 'email_send',
      name: 'Send Email',
      icon: Mail,
      color: 'bg-red-500',
      description: 'Send personalized emails via multiple providers',
      inputs: ['recipients', 'content', 'settings'],
      outputs: ['sent_results', 'delivery_status']
    },
    {
      id: 'wait_delay',
      name: 'Smart Wait',
      icon: Eye,
      color: 'bg-gray-500',
      description: 'Intelligent delays based on recipient behavior',
      inputs: ['duration', 'conditions'],
      outputs: ['next_step']
    }
  ];

  const addStep = (stepType) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: stepType.id,
      name: stepType.name,
      description: stepType.description,
      position: { 
        x: 100 + (workflow.steps.length * 250), // Spread steps horizontally
        y: 100 + (workflow.steps.length % 3) * 150 // Stack in rows of 3
      },
      config: {},
      inputs: stepType.inputs,
      outputs: stepType.outputs,
      status: 'pending'
    };
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    
    // Auto-select the new step
    setSelectedStep(newStep);
  };

  const deleteStep = (stepId) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId)
    }));
    
    // Deselect if the deleted step was selected
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  };

  const executeWorkflow = async () => {
    setIsRunning(true);
    setExecutionLog([]);
    
    try {
      const engine = new WorkflowEngine();
      const result = await engine.executeAdvancedWorkflow(workflow, {
        onProgress: (step, progress, message) => {
          setExecutionLog(prev => [...prev, {
            timestamp: new Date(),
            step,
            progress,
            message,
            type: 'info'
          }]);
        },
        onError: (step, error) => {
          setExecutionLog(prev => [...prev, {
            timestamp: new Date(),
            step,
            message: error.message,
            type: 'error'
          }]);
        },
        onSuccess: (step, data) => {
          setExecutionLog(prev => [...prev, {
            timestamp: new Date(),
            step,
            message: `Step completed successfully`,
            data,
            type: 'success'
          }]);
        }
      });
      
      console.log('Workflow execution completed:', result);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTemplateSelect = (template) => {
    if (template) {
      setWorkflow({
        ...template.workflow,
        id: Date.now(),
        variables: template.variables || {}
      });
    } else {
      // Start with blank workflow
      setWorkflow({
        id: Date.now(),
        name: 'Custom Workflow',
        description: 'Custom AI automation workflow',
        variables: {},
        steps: [],
        triggers: [],
        connections: []
      });
    }
    setShowTemplates(false);
  };

  const StepComponent = ({ step, isSelected, onClick, onDelete }) => {
    const stepType = stepTypes.find(t => t.id === step.type);
    const Icon = stepType?.icon || Bot;
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      setIsDragging(true);
      setDragStart({
        x: e.clientX - canvasRect.left - step.position.x,
        y: e.clientY - canvasRect.top - step.position.y
      });
      onClick(step);
    };
    
    const handleMouseMove = useCallback((e) => {
      if (!isDragging) return;
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const newPosition = {
        x: Math.max(0, e.clientX - canvasRect.left - dragStart.x),
        y: Math.max(0, e.clientY - canvasRect.top - dragStart.y)
      };
      
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s => 
          s.id === step.id ? { ...s, position: newPosition } : s
        )
      }));
    }, [isDragging, dragStart, step.id]);
    
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);
    
    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    return (
      <div
        className={`relative p-4 rounded-lg border-2 cursor-move transition-all duration-200 ${
          isSelected 
            ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
            : 'border-gray-300 hover:border-purple-300'
        } bg-white ${isDragging ? 'z-50' : 'z-10'}`}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: step.position.x,
          top: step.position.y,
          minWidth: '200px',
          userSelect: 'none'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded ${stepType?.color || 'bg-gray-500'} text-white`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{step.name}</h4>
            <p className="text-sm text-gray-500 truncate">{step.description}</p>
          </div>
        </div>
        
        {/* Status indicator and delete button */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            step.status === 'completed' ? 'bg-green-400' :
            step.status === 'running' ? 'bg-yellow-400' :
            step.status === 'error' ? 'bg-red-400' :
            'bg-gray-300'
          }`} />
          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Connection points */}
        <div className="absolute -right-2 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1/2" />
        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-green-500 rounded-full transform -translate-y-1/2" />
      </div>
    );
  };

  const StepConfigPanel = ({ step, onUpdate }) => {
    if (!step) return null;
    
    const stepType = stepTypes.find(t => t.id === step.type);
    
    return (
      <div className="h-full p-6 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded ${stepType?.color || 'bg-gray-500'} text-white`}>
            {React.createElement(stepType?.icon || Bot, { size: 20 })}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{step.name}</h3>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Name
            </label>
            <input
              type="text"
              value={step.name}
              onChange={(e) => onUpdate({ ...step, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {step.type === 'data_source' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheets URL
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={step.config.sheet_url || ''}
                onChange={(e) => onUpdate({ 
                  ...step, 
                  config: { ...step.config, sheet_url: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
          
          {step.type === 'ai_analysis' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Prompt
              </label>
              <textarea
                value={step.config.analysis_prompt || 'Analyze this contact data and categorize by priority, industry, and engagement level.'}
                onChange={(e) => onUpdate({ 
                  ...step, 
                  config: { ...step.config, analysis_prompt: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                placeholder="Describe how you want to analyze the data..."
              />
            </div>
          )}
          
          {step.type === 'ai_content' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Template
                </label>
                <textarea
                  value={step.config.template || 'Generate a personalized email about our {{product}} for {{contact_name}} at {{company}}'}
                  onChange={(e) => onUpdate({ 
                    ...step, 
                    config: { ...step.config, template: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                  placeholder="Use {{variable}} for dynamic content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Voice
                </label>
                <select
                  value={step.config.brand_voice || 'professional'}
                  onChange={(e) => onUpdate({ 
                    ...step, 
                    config: { ...step.config, brand_voice: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="urgent">Urgent</option>
                  <option value="casual">Casual</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
          )}
          
          {step.type === 'email_send' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Service
                </label>
                <select
                  value={step.config.email_service || 'resend'}
                  onChange={(e) => onUpdate({ 
                    ...step, 
                    config: { ...step.config, email_service: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={step.config.from_email || 'noreply@yourcompany.com'}
                  onChange={(e) => onUpdate({ 
                    ...step, 
                    config: { ...step.config, from_email: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Variables Available</h4>
          <div className="space-y-2 text-sm">
            {step.inputs?.map(input => (
              <div key={input} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-gray-600">{`{{${input}}}`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex">
      {/* Toolbar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 flex-shrink-0">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Builder</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">Drag & drop AI-powered automation steps</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click steps to add them to canvas</p>
            <p>• Drag steps to reposition</p>
            <p>• Select steps to configure</p>
            <p>• Use templates for quick start</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {stepTypes.map(stepType => {
            const Icon = stepType.icon;
            return (
              <button
                key={stepType.id}
                onClick={() => addStep(stepType)}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${stepType.color} text-white`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{stepType.name}</div>
                    <div className="text-xs text-gray-500">{stepType.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FileText size={16} />
            <span>Load Template</span>
          </button>
          
          <button
            onClick={executeWorkflow}
            disabled={isRunning || workflow.steps.length === 0}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            <span>{isRunning ? 'Running...' : 'Execute Workflow'}</span>
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-auto bg-gray-100">
        <div
          ref={canvasRef}
          className="relative"
          style={{ 
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', 
            backgroundSize: '25px 25px',
            width: '3000px',
            height: '2000px',
            minWidth: '100%',
            minHeight: '100%'
          }}
          onClick={(e) => {
            // Deselect step when clicking on empty canvas
            if (e.target === e.currentTarget) {
              setSelectedStep(null);
            }
          }}
        >
          {workflow.steps.map(step => (
            <StepComponent
              key={step.id}
              step={step}
              isSelected={selectedStep?.id === step.id}
              onClick={setSelectedStep}
              onDelete={() => deleteStep(step.id)}
            />
          ))}
          
          {workflow.steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Bot size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-600 mb-4">Add steps from the toolbar to create your AI automation</p>
                <button
                  onClick={() => addStep(stepTypes[0])}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus size={16} />
                  <span>Add First Step</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Execution Log */}
        {executionLog.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h4 className="font-medium text-gray-900 mb-3">Execution Log</h4>
            <div className="space-y-2">
              {executionLog.map((log, index) => (
                <div key={index} className={`text-sm flex items-center space-x-2 ${
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'success' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  <span className="text-xs text-gray-400">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Step Configuration Panel */}
      {selectedStep && (
        <div className="w-96 bg-white border-l border-gray-200 flex-shrink-0">
          <StepConfigPanel
            step={selectedStep}
            onUpdate={(updatedStep) => {
              setWorkflow(prev => ({
                ...prev,
                steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
              }));
              setSelectedStep(updatedStep);
            }}
          />
        </div>
      )}
      
      {/* Workflow Templates Modal */}
      {showTemplates && (
        <WorkflowTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;