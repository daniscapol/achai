import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Play, Save, Settings, Zap, Mail, Database, GitBranch, Bot, Eye, FileText, X, Move, ZoomIn, ZoomOut, Maximize2, Key, Trash2, ArrowRight, CheckCircle, AlertCircle, Clock, Loader, ArrowUpDown } from 'lucide-react';
import { WorkflowEngine } from './utils/advancedWorkflowEngine.js';
import WorkflowTemplates from './templates/WorkflowTemplates.jsx';
import { apiKeyManager } from './utils/apiKeyManager.js';

const EnhancedWorkflowBuilder = ({ onClose }) => {
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
  const [currentPhase, setCurrentPhase] = useState(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [apiKeyStatus, setApiKeyStatus] = useState({});
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedStep: null,
    offset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    canvasRect: null
  });
  
  const canvasRef = useRef(null);
  const engineRef = useRef(new WorkflowEngine());

  // Enhanced step types with better configuration
  const stepTypes = [
    {
      id: 'data_source',
      name: 'Data Source',
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      description: 'Import data from Google Sheets, CSV, or API',
      inputs: [],
      outputs: ['contacts', 'data'],
      config: {
        sheet_url: { type: 'url', label: 'Google Sheets URL', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
        api_endpoint: { type: 'url', label: 'API Endpoint', placeholder: 'https://api.example.com/data' },
        csv_file: { type: 'file', label: 'CSV File', accept: '.csv' }
      }
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      description: 'Analyze data with GPT-4 for insights and segmentation',
      inputs: ['data'],
      outputs: ['analyzed_data', 'segments', 'insights'],
      config: {
        analysis_prompt: { type: 'textarea', label: 'Analysis Prompt', placeholder: 'Analyze these leads and create segments...' },
        model: { type: 'select', label: 'AI Model', options: ['gpt-4', 'gpt-3.5-turbo'], default: 'gpt-4' }
      }
    },
    {
      id: 'ai_content',
      name: 'AI Content Generation',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      description: 'Generate personalized content with AI',
      inputs: ['data'],
      outputs: ['content', 'subject_lines'],
      config: {
        template: { type: 'textarea', label: 'Content Template', placeholder: 'Generate a professional email for {{contact_name}}...' },
        brand_voice: { type: 'select', label: 'Brand Voice', options: ['professional', 'friendly', 'consultative', 'urgent'], default: 'professional' }
      }
    },
    {
      id: 'condition',
      name: 'Smart Condition',
      icon: GitBranch,
      color: 'from-yellow-500 to-yellow-600',
      description: 'AI-powered decision branching',
      inputs: ['data'],
      outputs: ['true_path', 'false_path'],
      config: {
        condition_logic: { type: 'text', label: 'Condition Logic', placeholder: '{{data_count}} > 10' }
      }
    },
    {
      id: 'email_send',
      name: 'Send Email',
      icon: Mail,
      color: 'from-red-500 to-red-600',
      description: 'Send personalized emails via multiple providers',
      inputs: ['content'],
      outputs: ['sent_results', 'delivery_status'],
      config: {
        email_service: { type: 'select', label: 'Email Service', options: ['resend', 'sendgrid', 'mailgun'], default: 'resend' },
        from_email: { type: 'email', label: 'From Email', placeholder: 'noreply@yourcompany.com' }
      }
    },
    {
      id: 'wait_delay',
      name: 'Smart Wait',
      icon: Eye,
      color: 'from-gray-500 to-gray-600',
      description: 'Intelligent delays based on timing',
      inputs: ['trigger'],
      outputs: ['next_step'],
      config: {
        duration: { type: 'number', label: 'Duration (seconds)', placeholder: '300', min: 1 }
      }
    }
  ];

  // Enhanced API key status checking
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
    const interval = setInterval(checkApiKeys, 3000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard event handling for delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStep) {
        e.preventDefault();
        deleteStep(selectedStep.id);
      }
      if (e.key === 'Escape') {
        setSelectedStep(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStep]);

  // Enhanced drag and drop handlers
  const handleStepMouseDown = useCallback((e, step) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (!canvasRect) return;
    
    // Calculate precise offset from mouse to element origin
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setDragState({
      isDragging: true,
      draggedStep: step,
      offset,
      startPosition: { x: e.clientX, y: e.clientY },
      canvasRect
    });
    
    setSelectedStep(step);
  }, []);

  const handleGlobalMouseMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.draggedStep || !dragState.canvasRect) return;
    
    // Use cached canvas rect for performance and calculate position immediately
    const x = (e.clientX - dragState.canvasRect.left - dragState.offset.x - canvasPosition.x) / canvasZoom;
    const y = (e.clientY - dragState.canvasRect.top - dragState.offset.y - canvasPosition.y) / canvasZoom;
    
    // Update step position immediately for ultra-smooth dragging
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s => 
        s.id === dragState.draggedStep.id 
          ? { ...s, position: { x, y } }
          : s
      )
    }));
  }, [dragState, canvasPosition, canvasZoom]);

  const handleGlobalMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedStep: null,
      offset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      canvasRect: null
    });
  }, []);

  // Canvas panning handlers
  const handleCanvasMouseDown = useCallback((e) => {
    // Only pan if clicking on empty canvas (not on steps)
    if (e.target.closest('.workflow-step')) return;
    
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y });
  }, [canvasPosition]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      setCanvasPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Canvas zoom handler
  const handleCanvasWheel = useCallback((e) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, canvasZoom * zoomFactor));
    
    setCanvasZoom(newZoom);
  }, [canvasZoom]);

  // Manage global mouse event listeners for dragging and panning
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragState.isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Manage panning event listeners
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

  // Auto-connect steps when adding
  const addStep = (stepType) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: stepType.id,
      name: stepType.name,
      description: stepType.description,
      position: { 
        x: 200 + ((workflow.steps?.length || 0) * 320),
        y: 200
      },
      config: {},
      inputs: stepType.inputs,
      outputs: stepType.outputs,
      status: 'pending'
    };
    
    setWorkflow(prev => {
      const newConnections = [...prev.connections];
      
      // Auto-connect to previous step if exists
      if (prev.steps.length > 0) {
        const lastStep = prev.steps[prev.steps.length - 1];
        newConnections.push({
          id: `conn_${Date.now()}`,
          from: lastStep.id,
          to: newStep.id,
          fromOutput: lastStep.outputs?.[0] || 'output',
          toInput: newStep.inputs?.[0] || 'input'
        });
      }
      
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        connections: newConnections
      };
    });
    
    setSelectedStep(newStep);
    setShowTemplates(false);
    
    // Focus on new step (center canvas on it)
    setTimeout(() => {
      focusOnStep(newStep);
    }, 100);
  };

  const focusOnStep = (step) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    const newCanvasPosition = {
      x: centerX - (step.position.x * canvasZoom) - 160, // 160 = half step width
      y: centerY - (step.position.y * canvasZoom) - 80   // 80 = half step height
    };
    
    setCanvasPosition(newCanvasPosition);
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

  // Enhanced workflow execution with detailed logging
  const runWorkflow = async () => {
    if (workflow.steps.length === 0) {
      alert('Add some steps to your workflow first!');
      return;
    }

    setIsRunning(true);
    setExecutionLog([]);
    setCurrentPhase('Initializing...');

    const callbacks = {
      onProgress: (stepId, progress, message) => {
        setCurrentPhase(`${message} (${progress.toFixed(1)}%)`);
        setExecutionLog(prev => [
          ...prev,
          {
            type: 'progress',
            stepId,
            progress,
            message,
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Update step status in real-time
        setWorkflow(prev => ({
          ...prev,
          steps: prev.steps.map(s => 
            s.id === stepId 
              ? { ...s, status: progress === 100 ? 'completed' : 'running' }
              : s
          )
        }));
      },
      onError: (stepId, error) => {
        setExecutionLog(prev => [
          ...prev,
          {
            type: 'error',
            stepId,
            message: error.message,
            timestamp: new Date().toISOString()
          }
        ]);
        
        setWorkflow(prev => ({
          ...prev,
          steps: prev.steps.map(s => 
            s.id === stepId ? { ...s, status: 'error' } : s
          )
        }));
      },
      onSuccess: (stepId, result) => {
        setExecutionLog(prev => [
          ...prev,
          {
            type: 'success',
            stepId,
            message: `Step completed successfully`,
            result,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    };

    try {
      const result = await engineRef.current.executeAdvancedWorkflow(workflow, callbacks);
      setCurrentPhase('Workflow completed successfully!');
      setExecutionLog(prev => [
        ...prev,
        {
          type: 'completion',
          message: `Workflow finished: ${result.success ? 'Success' : 'Failed'}`,
          result,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      setCurrentPhase(`Workflow failed: ${error.message}`);
      setExecutionLog(prev => [
        ...prev,
        {
          type: 'error',
          message: `Workflow error: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsRunning(false);
      setTimeout(() => setCurrentPhase(null), 5000);
    }
  };

  // Save workflow to database
  const saveWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: {
            ...workflow,
            name: workflow.name || 'Untitled Workflow'
          },
          userId: 'user_123'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setWorkflow(prev => ({ ...prev, id: result.workflow.id }));
        alert('Workflow saved successfully!');
      } else {
        alert('Failed to save workflow: ' + result.error);
      }
    } catch (error) {
      alert('Error saving workflow: ' + error.message);
    }
  };

  // Load template with pre-connected steps
  const loadTemplate = (template) => {
    try {
      console.log('Loading template:', template);
      
      // Handle null template (blank workflow)
      if (!template) {
        setWorkflow({
          id: Date.now(),
          name: '',
          description: '',
          steps: [],
          connections: []
        });
        setConnections([]);
        return;
      }
      
      // Handle different template data structures
      let templateData;
      if (template.workflow_data) {
        templateData = typeof template.workflow_data === 'string' 
          ? JSON.parse(template.workflow_data) 
          : template.workflow_data;
      } else if (template.workflow) {
        // Handle templates with workflow property
        templateData = template.workflow;
      } else {
        // Fallback for direct template objects
        templateData = template;
      }
      
      console.log('Template data parsed:', templateData);
      
      // Validate template data
      if (!templateData || !templateData.steps || !Array.isArray(templateData.steps)) {
        console.error('Invalid template data - missing or invalid steps array:', templateData);
        alert('Invalid template data. Please try a different template.');
        return;
      }
      
      // Create connections for template steps
      const connections = [];
      if (templateData.steps.length > 1) {
        for (let i = 0; i < templateData.steps.length - 1; i++) {
          const currentStep = templateData.steps[i];
          const nextStep = templateData.steps[i + 1];
          
          if (currentStep && nextStep && currentStep.id && nextStep.id) {
            connections.push({
              id: `conn_${Date.now()}_${i}`,
              from: currentStep.id,
              to: nextStep.id,
              fromOutput: currentStep.outputs?.[0] || 'output',
              toInput: nextStep.inputs?.[0] || 'input'
            });
          }
        }
      }
      
      // Create the workflow object
      const newWorkflow = {
        id: null,
        name: templateData.name || template.name || 'Untitled Workflow',
        description: templateData.description || template.description || 'Loaded from template',
        variables: templateData.variables || {},
        steps: templateData.steps.map(step => ({
          ...step,
          status: 'pending' // Reset status for new workflow
        })),
        triggers: templateData.triggers || [],
        connections: connections
      };
      
      console.log('Setting workflow:', newWorkflow);
      
      setWorkflow(newWorkflow);
      setShowTemplates(false);
      setSelectedStep(null);
      
      // Focus on the first step if it exists
      if (newWorkflow.steps.length > 0) {
        setTimeout(() => {
          focusOnStep(newWorkflow.steps[0]);
        }, 100);
      }
      
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Professional Workflow Builder</h2>
            {currentPhase && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">{currentPhase}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
              title="Manage API Keys"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Keys</span>
            </button>
            
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
              title="Save Workflow"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            
            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isRunning ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Step Types */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add Steps</h3>
              <div className="space-y-2">
                {stepTypes.map((stepType) => {
                  const Icon = stepType.icon;
                  return (
                    <button
                      key={stepType.id}
                      onClick={() => addStep(stepType)}
                      className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stepType.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {stepType.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stepType.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Templates Section */}
              {showTemplates && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Templates</h3>
                  <WorkflowTemplates onSelectTemplate={loadTemplate} />
                </div>
              )}
            </div>
          </div>

          {/* Main Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-grab active:cursor-grabbing"
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleCanvasWheel}
          >
            
            {/* Workflow Steps */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasZoom})`
              }}
            >
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {workflow.connections?.map((connection) => {
                  const fromStep = workflow.steps.find(s => s.id === connection.from);
                  const toStep = workflow.steps.find(s => s.id === connection.to);
                  
                  if (!fromStep || !toStep) return null;
                  
                  const startX = fromStep.position.x + 160; // Step width
                  const startY = fromStep.position.y + 40;  // Half step height
                  const endX = toStep.position.x;
                  const endY = toStep.position.y + 40;
                  
                  const midX = (startX + endX) / 2;
                  
                  return (
                    <g key={connection.id}>
                      <defs>
                        <marker
                          id={`arrowhead-${connection.id}`}
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
                        markerEnd={`url(#arrowhead-${connection.id})`}
                        className="drop-shadow-sm"
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Workflow Steps */}
              {workflow.steps?.map((step) => {
                const stepType = stepTypes.find(t => t.id === step.type);
                const Icon = stepType?.icon || Bot;
                const isSelected = selectedStep?.id === step.id;
                const isDragging = dragState.draggedStep?.id === step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`workflow-step absolute w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all cursor-move select-none ${
                      isSelected 
                        ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-800' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    } ${
                      isDragging ? 'scale-105 rotate-1 z-50' : 'z-10'
                    } ${
                      step.status === 'running' ? 'ring-2 ring-blue-400 ring-opacity-50' :
                      step.status === 'completed' ? 'ring-2 ring-green-400 ring-opacity-50' :
                      step.status === 'error' ? 'ring-2 ring-red-400 ring-opacity-50' : ''
                    }`}
                    style={{
                      left: step.position.x,
                      top: step.position.y,
                      transform: isDragging ? 'scale(1.05) rotate(1deg)' : 'none'
                    }}
                    onMouseDown={(e) => handleStepMouseDown(e, step)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStep(step);
                    }}
                  >
                    {/* Step Header */}
                    <div className={`p-4 rounded-t-lg bg-gradient-to-r ${stepType?.color || 'from-gray-500 to-gray-600'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-white" />
                          <div>
                            <h3 className="font-semibold text-white text-lg">{step.name}</h3>
                            <p className="text-white/80 text-sm">{step.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Status Indicator */}
                          {step.status === 'running' && <Loader className="w-5 h-5 text-white animate-spin" />}
                          {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-white" />}
                          {step.status === 'error' && <AlertCircle className="w-5 h-5 text-white" />}
                          {step.status === 'pending' && <Clock className="w-5 h-5 text-white/60" />}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStep(step.id);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Delete Step"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Type:</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {step.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Input/Output Indicators */}
                        <div className="flex justify-between text-xs">
                          <div className="text-green-600 dark:text-green-400">
                            {step.inputs?.length > 0 && `Inputs: ${step.inputs.join(', ')}`}
                          </div>
                          <div className="text-blue-600 dark:text-blue-400">
                            {step.outputs?.length > 0 && `Outputs: ${step.outputs.join(', ')}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Canvas Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setCanvasZoom(Math.min(2, canvasZoom + 0.1))}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setCanvasZoom(1);
                  setCanvasPosition({ x: 0, y: 0 });
                }}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Sidebar - Dynamic Configuration Panel */}
          {selectedStep && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
              <StepConfigurationPanel 
                step={selectedStep}
                stepType={stepTypes.find(t => t.id === selectedStep.type)}
                onUpdateStep={(updatedStep) => {
                  setWorkflow(prev => ({
                    ...prev,
                    steps: prev.steps.map(s => 
                      s.id === updatedStep.id ? updatedStep : s
                    )
                  }));
                  setSelectedStep(updatedStep);
                }}
                onDeleteStep={() => deleteStep(selectedStep.id)}
                onClose={() => setSelectedStep(null)}
                apiKeyStatus={apiKeyStatus}
              />
            </div>
          )}

          {/* API Keys Management Panel */}
          {showApiKeys && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
              <ApiKeysPanel 
                apiKeyStatus={apiKeyStatus}
                onClose={() => setShowApiKeys(false)}
              />
            </div>
          )}
        </div>

        {/* Enhanced Execution Log */}
        {(isRunning || executionLog.length > 0) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 max-h-48 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Execution Log</h3>
            <div className="space-y-1 font-mono text-sm">
              {executionLog.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    log.type === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                    log.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                    log.type === 'progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {log.type === 'error' && <AlertCircle className="w-4 h-4" />}
                  {log.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {log.type === 'progress' && <Loader className="w-4 h-4 animate-spin" />}
                  {log.type === 'completion' && <CheckCircle className="w-4 h-4" />}
                  
                  <span className="text-xs opacity-60">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex-1">{log.message}</span>
                  {log.progress !== undefined && (
                    <span className="text-xs font-bold">{log.progress.toFixed(1)}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dynamic Step Configuration Panel Component
const StepConfigurationPanel = ({ step, stepType, onUpdateStep, onDeleteStep, onClose, apiKeyStatus }) => {
  const [config, setConfig] = useState(step.config || {});

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateStep({ ...step, config: newConfig });
  };

  const updateStepName = (name) => {
    onUpdateStep({ ...step, name });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configure Step</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onDeleteStep}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Step"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Step Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Step Name
        </label>
        <input
          type="text"
          value={step.name}
          onChange={(e) => updateStepName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter step name..."
        />
      </div>

      {/* API Key Requirements */}
      {(step.type === 'ai_analysis' || step.type === 'ai_content') && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">OpenAI API Key Required</span>
          </div>
          <div className="flex items-center gap-2">
            {apiKeyStatus.openai ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ${apiKeyStatus.openai ? 'text-green-600' : 'text-red-600'}`}>
              {apiKeyStatus.openai ? 'API Key Configured' : 'API Key Missing'}
            </span>
          </div>
        </div>
      )}

      {step.type === 'email_send' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Email Service API Key Required</span>
          </div>
          <div className="space-y-1">
            {['resend', 'sendgrid', 'mailgun'].map(service => (
              <div key={service} className="flex items-center gap-2">
                {apiKeyStatus[service] ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm capitalize ${apiKeyStatus[service] ? 'text-green-600' : 'text-red-600'}`}>
                  {service}: {apiKeyStatus[service] ? 'Configured' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Configuration Fields */}
      <div className="space-y-4">
        {stepType?.config && Object.entries(stepType.config).map(([key, fieldConfig]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {fieldConfig.label}
            </label>
            
            {fieldConfig.type === 'text' && (
              <input
                type="text"
                value={config[key] || ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={fieldConfig.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            
            {fieldConfig.type === 'textarea' && (
              <textarea
                value={config[key] || ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={fieldConfig.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            )}
            
            {fieldConfig.type === 'select' && (
              <select
                value={config[key] || fieldConfig.default || ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {fieldConfig.options.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            )}
            
            {fieldConfig.type === 'number' && (
              <input
                type="number"
                value={config[key] || ''}
                onChange={(e) => updateConfig(key, parseInt(e.target.value) || 0)}
                placeholder={fieldConfig.placeholder}
                min={fieldConfig.min}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            
            {fieldConfig.type === 'url' && (
              <input
                type="url"
                value={config[key] || ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={fieldConfig.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            
            {fieldConfig.type === 'email' && (
              <input
                type="email"
                value={config[key] || ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={fieldConfig.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      {/* Save Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Save is automatic, just provide visual feedback
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save & Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Step Information */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Step Information</h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-mono">{step.type}</span>
          </div>
          <div className="flex justify-between">
            <span>ID:</span>
            <span className="font-mono text-xs">{step.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-medium ${
              step.status === 'completed' ? 'text-green-600' :
              step.status === 'running' ? 'text-blue-600' :
              step.status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {step.status || 'pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// API Keys Management Panel Component
const ApiKeysPanel = ({ apiKeyStatus, onClose }) => {
  const [keys, setKeys] = useState({
    openai: '',
    resend: '',
    sendgrid: '',
    mailgun: ''
  });

  const updateApiKey = (service, key) => {
    try {
      if (key.trim()) {
        apiKeyManager.storeKey(service, key.trim());
        alert(`${service} API key saved successfully!`);
      } else {
        apiKeyManager.removeKey(service);
        alert(`${service} API key removed!`);
      }
      setKeys(prev => ({ ...prev, [service]: '' }));
    } catch (error) {
      alert(`Error saving ${service} API key: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(keys).map(([service, key]) => (
          <div key={service}>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {service} API Key
              </label>
              {apiKeyStatus[service] ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKeys(prev => ({ ...prev, [service]: e.target.value }))}
                placeholder={`Enter ${service} API key...`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => updateApiKey(service, key)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {service === 'openai' && 'Required for AI analysis and content generation'}
              {service === 'resend' && 'Required for email sending via Resend'}
              {service === 'sendgrid' && 'Required for email sending via SendGrid'}
              {service === 'mailgun' && 'Required for email sending via Mailgun'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Status</h4>
        <div className="space-y-1 text-sm">
          {Object.entries(apiKeyStatus).map(([service, status]) => (
            <div key={service} className="flex items-center gap-2">
              {status ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`capitalize ${status ? 'text-green-600' : 'text-red-600'}`}>
                {service}: {status ? 'Configured' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkflowBuilder;