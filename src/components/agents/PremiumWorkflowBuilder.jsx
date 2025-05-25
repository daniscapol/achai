import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Play, Save, Settings, Zap, Mail, Database, GitBranch, Bot, Eye, FileText, X, Move, ZoomIn, ZoomOut, Maximize2, Key } from 'lucide-react';
import { WorkflowEngine } from './utils/advancedWorkflowEngine.js';
import WorkflowTemplates from './templates/WorkflowTemplates.jsx';
import { apiKeyManager } from './utils/apiKeyManager.js';

const PremiumWorkflowBuilder = ({ onClose }) => {
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
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [apiKeyStatus, setApiKeyStatus] = useState({});
  const canvasRef = useRef(null);

  // Check API key status on component mount
  useEffect(() => {
    const checkApiKeys = () => {
      try {
        setApiKeyStatus({
          openai: !!apiKeyManager.getKey('openai'),
          resend: !!apiKeyManager.getKey('resend'),
          sendgrid: !!apiKeyManager.getKey('sendgrid'),
          mailgun: !!apiKeyManager.getKey('mailgun')
        });
      } catch (error) {
        console.error('Error checking API keys:', error);
      }
    };
    
    checkApiKeys();
    // Check every 5 seconds (reduced frequency for performance)
    const interval = setInterval(checkApiKeys, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup all global event listeners on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining global listeners
      document.removeEventListener('mousemove', handleCanvasMouseMove);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, []);

  const stepTypes = [
    {
      id: 'data_source',
      name: 'Data Source',
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      description: 'Import data from Google Sheets, CSV, or API',
      inputs: ['sheet_url', 'api_endpoint', 'csv_file'],
      outputs: ['contacts', 'data']
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      description: 'Analyze data with GPT-4 for insights and segmentation',
      inputs: ['data', 'analysis_prompt'],
      outputs: ['analyzed_data', 'segments', 'insights']
    },
    {
      id: 'ai_content',
      name: 'AI Content Generation',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      description: 'Generate personalized content with AI',
      inputs: ['data', 'template', 'brand_voice'],
      outputs: ['content', 'subject_lines', 'variations']
    },
    {
      id: 'condition',
      name: 'Smart Condition',
      icon: GitBranch,
      color: 'from-yellow-500 to-yellow-600',
      description: 'AI-powered decision branching',
      inputs: ['data', 'condition_logic'],
      outputs: ['true_path', 'false_path', 'maybe_path']
    },
    {
      id: 'email_send',
      name: 'Send Email',
      icon: Mail,
      color: 'from-red-500 to-red-600',
      description: 'Send personalized emails via multiple providers',
      inputs: ['recipients', 'content', 'settings'],
      outputs: ['sent_results', 'delivery_status']
    },
    {
      id: 'wait_delay',
      name: 'Smart Wait',
      icon: Eye,
      color: 'from-gray-500 to-gray-600',
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
        x: 200 + ((workflow.steps?.length || 0) * 320), // Better spacing
        y: 150 + (((workflow.steps?.length || 0) % 3) * 200) // Stagger in 3 rows
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
    
    setSelectedStep(newStep);
  };

  const deleteStep = (stepId) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId),
      connections: prev.connections.filter(c => c.from !== stepId && c.to !== stepId)
    }));
    
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  };

  const connectSteps = (fromId, toId) => {
    const connection = { from: fromId, to: toId, id: `${fromId}-${toId}` };
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections.filter(c => c.from !== fromId || c.to !== toId), connection]
    }));
  };

  // Canvas panning functionality
  const handleCanvasMouseDown = (e) => {
    // Only pan if clicking on canvas background, not on steps
    if (e.target.getAttribute('data-canvas') === 'true' || 
        e.target.getAttribute('data-canvas-container') === 'true') {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ 
        x: e.clientX - canvasPosition.x, 
        y: e.clientY - canvasPosition.y 
      });
      setSelectedStep(null);
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isPanning) return;
    e.preventDefault();
    setCanvasPosition({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleTemplateSelect = (template) => {
    if (template) {
      setWorkflow({
        ...template.workflow,
        id: Date.now(),
        variables: template.variables || {}
      });
    } else {
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

  const saveWorkflow = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow: workflow,
          userId: 'anonymous' // Could be replaced with actual user system
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Workflow saved successfully!');
        console.log('Saved workflow:', result.workflow);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow: ' + error.message);
    }
  };

  const executeWorkflow = async () => {
    // Check if required API keys are available
    if (!apiKeyStatus.openai) {
      alert('OpenAI API key is required for AI analysis and content generation. Please add your API key first.');
      return;
    }
    
    if (!apiKeyStatus.resend && !apiKeyStatus.sendgrid && !apiKeyStatus.mailgun) {
      alert('At least one email service API key (Resend, SendGrid, or Mailgun) is required for sending emails. Please add an API key first.');
      return;
    }
    
    setIsRunning(true);
    setExecutionLog([]);
    
    // Start workflow execution tracking
    let executionId = null;
    const startTime = Date.now();
    
    try {
      // Save execution start to database
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const executionStart = await fetch(`${API_BASE_URL}/workflow-executions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow_id: workflow.id || null,
          status: 'running',
          input_data: { steps_count: workflow.steps?.length || 0 },
          steps_total: workflow.steps?.length || 0
        })
      });
      
      const executionResult = await executionStart.json();
      if (executionResult.success) {
        executionId = executionResult.execution.id;
      }
      
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
      
      // Save execution completion to database
      if (executionId) {
        try {
          await fetch(`${API_BASE_URL}/workflow-executions/${executionId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'completed',
              completed_at: new Date().toISOString(),
              results: result,
              execution_log: executionLog,
              steps_completed: result.stepsExecuted || 0,
              contacts_processed: result.contactsProcessed || 0,
              emails_sent: result.emailsSent || 0,
              execution_time_ms: Date.now() - startTime
            })
          });
        } catch (dbError) {
          console.error('Error saving execution results:', dbError);
        }
      }
      
      console.log('Workflow execution completed:', result);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      
      // Save execution failure to database
      if (executionId) {
        try {
          await fetch(`${API_BASE_URL}/workflow-executions/${executionId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error.message,
              execution_log: executionLog,
              execution_time_ms: Date.now() - startTime
            })
          });
        } catch (dbError) {
          console.error('Error saving execution failure:', dbError);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const StepComponent = ({ step, isSelected, onClick, onDelete }) => {
    const stepType = stepTypes.find(t => t.id === step.type);
    const Icon = stepType?.icon || Bot;
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Calculate precise offset from mouse to step position within the step
      setDragOffset({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      });
      
      setIsDragging(true);
      onClick(step);
    };
    
    const handleMouseMove = useCallback((e) => {
      if (!isDragging) return;
      
      const canvasElement = document.querySelector('[data-canvas-container="true"]');
      if (!canvasElement) return;
      
      const canvasRect = canvasElement.getBoundingClientRect();
      
      // Calculate new position relative to canvas container, accounting for canvas pan
      const newPosition = {
        x: Math.max(0, e.clientX - canvasRect.left - dragOffset.x - canvasPosition.x),
        y: Math.max(0, e.clientY - canvasRect.top - dragOffset.y - canvasPosition.y)
      };
      
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s => 
          s.id === step.id ? { ...s, position: newPosition } : s
        )
      }));
    }, [isDragging, dragOffset, step.id, canvasPosition]);
    
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);
    
    useEffect(() => {
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
        className={`absolute bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
          isSelected 
            ? 'border-purple-500 ring-4 ring-purple-100' 
            : 'border-gray-200 hover:border-purple-300'
        } ${isDragging ? 'scale-105 shadow-2xl' : ''}`}
        style={{
          left: step.position.x,
          top: step.position.y,
          width: '280px',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'move',
          zIndex: isDragging ? 1000 : 10
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${stepType?.color || 'from-gray-500 to-gray-600'} text-white p-4 rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon size={20} />
              <div>
                <h4 className="font-medium">{step.name}</h4>
                <p className="text-xs opacity-90">{stepType?.name}</p>
              </div>
            </div>
            
            {/* Status and controls */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                step.status === 'completed' ? 'bg-green-400' :
                step.status === 'running' ? 'bg-yellow-400' :
                step.status === 'error' ? 'bg-red-400' :
                'bg-white/30'
              }`} />
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
          
          {/* Input/Output indicators */}
          <div className="flex justify-between text-xs">
            <div className="text-gray-400">
              {step.inputs?.length || 0} inputs
            </div>
            <div className="text-gray-400">
              {step.outputs?.length || 0} outputs
            </div>
          </div>
        </div>
        
        {/* Connection points */}
        <div className="absolute left-0 top-1/2 w-4 h-4 bg-green-500 rounded-full transform -translate-x-2 -translate-y-2 border-2 border-white shadow" />
        <div className="absolute right-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform translate-x-2 -translate-y-2 border-2 border-white shadow" />
      </div>
    );
  };

  const ConnectionLine = ({ connection }) => {
    const fromStep = workflow.steps?.find(s => s.id === connection.from);
    const toStep = workflow.steps?.find(s => s.id === connection.to);
    
    if (!fromStep || !toStep) return null;
    
    const startX = fromStep.position.x + 280; // Step width
    const startY = fromStep.position.y + 70; // Half step height
    const endX = toStep.position.x;
    const endY = toStep.position.y + 70;
    
    const midX = (startX + endX) / 2;
    
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6366f1"
            />
          </marker>
        </defs>
        <path
          d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          className="drop-shadow-sm"
        />
      </svg>
    );
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Workflow Builder</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{workflow.steps?.length || 0} steps</span>
            <span>•</span>
            <span>{workflow.connections?.length || 0} connections</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Canvas controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Click & drag canvas to pan • Drag steps to move
            </span>
          </div>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {/* API Key Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Key size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">
                {Object.values(apiKeyStatus).filter(Boolean).length}/4 keys
              </span>
            </div>
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${apiKeyStatus.openai ? 'bg-green-400' : 'bg-red-400'}`} title="OpenAI" />
              <div className={`w-2 h-2 rounded-full ${apiKeyStatus.resend ? 'bg-green-400' : 'bg-red-400'}`} title="Resend" />
              <div className={`w-2 h-2 rounded-full ${apiKeyStatus.sendgrid ? 'bg-green-400' : 'bg-red-400'}`} title="SendGrid" />
              <div className={`w-2 h-2 rounded-full ${apiKeyStatus.mailgun ? 'bg-green-400' : 'bg-red-400'}`} title="Mailgun" />
            </div>
          </div>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {/* Action buttons */}
          <button
            onClick={() => {
              // Go back to main agent runner to access API key management
              if (onClose) onClose();
            }}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Key size={14} />
            <span>Manage Keys</span>
          </button>
          
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Templates</span>
          </button>
          
          <button
            onClick={saveWorkflow}
            disabled={(workflow.steps?.length || 0) === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          
          <button
            onClick={executeWorkflow}
            disabled={isRunning || (workflow.steps?.length || 0) === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Play size={16} />
            <span>{isRunning ? 'Running...' : 'Execute'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Left Sidebar - Step Types */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Add Steps</h3>
            <div className="space-y-3">
              {stepTypes.map(stepType => {
                const Icon = stepType.icon;
                return (
                  <button
                    key={stepType.id}
                    onClick={() => addStep(stepType)}
                    className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stepType.color} text-white group-hover:shadow-lg transition-shadow`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-900">
                          {stepType.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {stepType.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          <div
            ref={canvasRef}
            data-canvas="true"
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '25px 25px',
              backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            {/* Canvas content container */}
            <div
              data-canvas-container="true"
              style={{
                transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
                width: '4000px',
                height: '3000px',
                position: 'relative'
              }}
            >
              {/* Connection lines */}
              {workflow.connections?.map(connection => (
                <ConnectionLine key={connection.id} connection={connection} />
              ))}
              
              {/* Steps */}
              {workflow.steps?.map(step => (
                <StepComponent
                  key={step.id}
                  step={step}
                  isSelected={selectedStep?.id === step.id}
                  onClick={setSelectedStep}
                  onDelete={() => deleteStep(step.id)}
                />
              ))}
              
              {/* Empty state */}
              {(workflow.steps?.length || 0) === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Bot size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Start Building Your Workflow
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose from professional templates or add steps from the sidebar to create your AI automation
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Browse Templates
                      </button>
                      <button
                        onClick={() => addStep(stepTypes[0])}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Add First Step
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Step Configuration */}
        {selectedStep && (
          <div className="w-96 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-gray-900">Configure Step</h3>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Step configuration form would go here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) => {
                      const updatedStep = { ...selectedStep, name: e.target.value };
                      setWorkflow(prev => ({
                        ...prev,
                        steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
                      }));
                      setSelectedStep(updatedStep);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedStep.description}
                    onChange={(e) => {
                      const updatedStep = { ...selectedStep, description: e.target.value };
                      setWorkflow(prev => ({
                        ...prev,
                        steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
                      }));
                      setSelectedStep(updatedStep);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Execution Log */}
      {executionLog.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
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
      
      {/* Templates Modal */}
      {showTemplates && (
        <WorkflowTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default PremiumWorkflowBuilder;