import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Plus, Play, Save, Settings, Key, X, Trash2, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import WorkflowTemplates from './templates/WorkflowTemplates.jsx';
import CustomWorkflowNode from './nodes/CustomWorkflowNode.jsx';
import { apiKeyManager } from './utils/apiKeyManager.js';
import { WorkflowEngine } from './utils/advancedWorkflowEngine.js';

// Custom node types for React Flow
const nodeTypes = {
  workflowStep: CustomWorkflowNode,
};

// Initial node position counter
let nodeId = 0;
const getId = () => `node_${nodeId++}`;

const ReactFlowWorkflowBuilder = ({ onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState({
    id: null,
    name: 'Untitled Workflow',
    description: '',
  });
  
  const [showTemplates, setShowTemplates] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('');

  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);
  const engineRef = useRef(new WorkflowEngine());

  // Initialize API key status
  React.useEffect(() => {
    const checkApiKeys = async () => {
      const status = {};
      const services = ['openai', 'resend', 'sendgrid', 'mailgun'];
      
      for (const service of services) {
        try {
          const key = apiKeyManager.getKey(service);
          status[service] = key ? apiKeyManager.validateKey(service, key) : false;
        } catch {
          status[service] = false;
        }
      }
      
      setApiKeyStatus(status);
    };
    
    checkApiKeys();
  }, []);

  // Available step types for the workflow
  const stepTypes = [
    {
      id: 'data_source',
      name: 'Data Source',
      description: 'Import data from various sources',
      icon: '📊',
      color: '#3B82F6',
      inputs: [],
      outputs: ['data'],
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      description: 'Analyze data using AI models',
      icon: '🤖',
      color: '#8B5CF6',
      inputs: ['data'],
      outputs: ['analysis', 'insights'],
    },
    {
      id: 'ai_content',
      name: 'AI Content Generation',
      description: 'Generate content using AI',
      icon: '✍️',
      color: '#10B981',
      inputs: ['context', 'data'],
      outputs: ['content'],
    },
    {
      id: 'email_send',
      name: 'Email Send',
      description: 'Send emails via multiple providers',
      icon: '📧',
      color: '#F59E0B',
      inputs: ['content', 'recipients'],
      outputs: ['sent_status'],
    },
    {
      id: 'wait_delay',
      name: 'Wait/Delay',
      description: 'Add delays between actions',
      icon: '⏱️',
      color: '#6B7280',
      inputs: ['trigger'],
      outputs: ['continue'],
    },
  ];

  // Handle connection between nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add new step to the workflow
  const addStep = (stepType) => {
    const step = stepTypes.find(t => t.id === stepType);
    if (!step) return;

    // Smart positioning: place new steps to the right and slightly down
    const existingPositions = nodes.map(n => n.position);
    let position;
    
    if (existingPositions.length === 0) {
      // First step - center it
      position = { x: 300, y: 200 };
    } else {
      // Find the rightmost step and place new step to its right
      const rightmostX = Math.max(...existingPositions.map(p => p.x));
      
      // For templates with multiple end nodes, find a good Y position
      const rightmostNodes = existingPositions.filter(p => p.x >= rightmostX - 50); // Within 50px of rightmost
      const averageY = rightmostNodes.length > 0 
        ? rightmostNodes.reduce((sum, p) => sum + p.y, 0) / rightmostNodes.length
        : existingPositions.reduce((sum, p) => sum + p.y, 0) / existingPositions.length;
      
      position = { 
        x: rightmostX + 400, // Increased spacing for better separation
        y: averageY
      };
    }

    const newNodeId = getId();
    const newNode = {
      id: newNodeId,
      type: 'workflowStep',
      position,
      data: {
        label: step.name,
        stepType: step,
        config: {},
        status: 'pending',
        onDelete: (nodeId) => {
          setNodes((nds) => nds.filter((n) => n.id !== nodeId));
          setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        onSelect: (nodeData, nodeId) => {
          console.log('Node selected:', { nodeData, nodeId });
          setSelectedNode({ ...nodeData, id: nodeId });
          setShowConfigPanel(true);
          setShowTemplates(false);
          setShowApiKeys(false);
        },
      },
      dragHandle: '.custom-drag-handle',
    };

    setNodes((nds) => nds.concat(newNode));

    // Smart auto-connect: only connect if there's a clear single end node
    if (nodes.length > 0) {
      // Find nodes that don't have outgoing connections (potential end nodes)
      const nodesWithoutOutgoing = nodes.filter(node => 
        !edges.some(edge => edge.source === node.id)
      );
      
      console.log('Nodes without outgoing connections:', nodesWithoutOutgoing.length);
      
      // Only auto-connect if there's exactly one end node (clear linear flow)
      // or if there are multiple end nodes but we can find the rightmost one clearly
      if (nodesWithoutOutgoing.length === 1) {
        // Perfect case: exactly one end node
        const targetNode = nodesWithoutOutgoing[0];
        const newEdge = {
          id: `edge_${targetNode.id}_${newNodeId}`,
          source: targetNode.id,
          target: newNodeId,
          type: 'smoothstep',
          animated: true,
        };
        setEdges((eds) => eds.concat(newEdge));
        console.log('Auto-connected to single end node:', targetNode.id);
      } else if (nodesWithoutOutgoing.length > 1) {
        // Multiple end nodes - connect to the rightmost one
        const targetNode = nodesWithoutOutgoing.reduce((rightmost, current) => 
          current.position.x > rightmost.position.x ? current : rightmost
        );
        const newEdge = {
          id: `edge_${targetNode.id}_${newNodeId}`,
          source: targetNode.id,
          target: newNodeId,
          type: 'smoothstep',
          animated: true,
        };
        setEdges((eds) => eds.concat(newEdge));
        console.log('Auto-connected to rightmost end node:', targetNode.id);
      } else {
        console.log('No auto-connection: all nodes have outgoing connections');
      }
    }
  };

  // Load template workflow
  const loadTemplate = (template) => {
    if (!template) {
      // Create blank workflow
      setNodes([]);
      setEdges([]);
      setWorkflow({
        id: Date.now(),
        name: 'Untitled Workflow',
        description: '',
      });
      setShowTemplates(false);
      return;
    }

    const templateData = template.workflow;
    if (!templateData || !templateData.steps) {
      alert('Invalid template data');
      return;
    }

    // Convert template steps to React Flow nodes
    const newNodes = templateData.steps.map((step, index) => ({
      id: `node_${index}`,
      type: 'workflowStep',
      position: step.position || { x: index * 200 + 100, y: 200 },
      data: {
        label: step.name,
        stepType: stepTypes.find(t => t.id === step.type) || stepTypes[0],
        config: step.config || {},
        status: 'pending',
        onDelete: (nodeId) => {
          setNodes((nds) => nds.filter((n) => n.id !== nodeId));
          setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        onSelect: (nodeData, nodeId) => {
          console.log('Node selected:', { nodeData, nodeId });
          setSelectedNode({ ...nodeData, id: nodeId });
          setShowConfigPanel(true);
          setShowTemplates(false);
          setShowApiKeys(false);
        },
      },
      dragHandle: '.custom-drag-handle',
    }));

    // Create connections between sequential steps
    const newEdges = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      newEdges.push({
        id: `edge_${i}`,
        source: newNodes[i].id,
        target: newNodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setWorkflow({
      id: template.id,
      name: templateData.name || template.name,
      description: templateData.description || template.description,
    });
    setShowTemplates(false);
  };

  // Save workflow
  const saveWorkflow = () => {
    const workflowData = {
      ...workflow,
      nodes,
      edges,
      lastModified: new Date().toISOString(),
    };
    console.log('Saving workflow:', workflowData);
    // Here you would typically save to your backend
  };

  // Run workflow
  const runWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some steps to your workflow first');
      return;
    }

    setIsRunning(true);
    setExecutionLog([]);

    try {
      // Simulate workflow execution
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Update node status to running
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, status: 'running' } }
              : n
          )
        );

        // Log execution
        setExecutionLog((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            message: `Executing ${node.data.label}...`,
            type: 'info',
          },
        ]);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Update node status to completed
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, status: 'completed' } }
              : n
          )
        );

        setExecutionLog((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            message: `✅ ${node.data.label} completed successfully`,
            type: 'success',
          },
        ]);
      }
    } catch (error) {
      setExecutionLog((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message: `❌ Execution failed: ${error.message}`,
          type: 'error',
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      {/* Custom styles for React Flow cursor behavior */}
      <style>{`
        .react-flow__pane {
          cursor: grab !important;
        }
        .react-flow__pane:active {
          cursor: grabbing !important;
        }
        .custom-drag-handle {
          cursor: move !important;
        }
        .custom-drag-handle:hover {
          cursor: move !important;
        }
        .react-flow__node:hover .custom-drag-handle {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        .react-flow__handle {
          cursor: crosshair !important;
          transition: all 0.2s ease !important;
        }
        .react-flow__handle:hover {
          transform: scale(1.3) !important;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5) !important;
        }
        .react-flow__connectionline {
          stroke: #3B82F6 !important;
          stroke-width: 3px !important;
        }
        .react-flow__edge {
          cursor: pointer !important;
        }
        .react-flow__edge:hover {
          filter: brightness(1.2) !important;
        }
        .react-flow__handle.connectingfrom {
          background: #22c55e !important;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
        }
        .react-flow__handle.connectingto {
          background: #ef4444 !important;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">React Flow Workflow Builder</h2>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              Professional Edition
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Keys</span>
            </button>

            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
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

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Add Steps Panel */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            {/* Add Step Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Workflow Steps</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop these components to build your workflow
              </p>
            </div>
            
            {/* Steps List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                {stepTypes.map((stepType) => (
                  <button
                    key={stepType.id}
                    onClick={() => addStep(stepType.id)}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                        style={{ backgroundColor: stepType.color }}
                      >
                        {stepType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {stepType.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                          {stepType.description}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {stepType.inputs?.length || 0} inputs
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {stepType.outputs?.length || 0} outputs
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowTemplates(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Settings className="w-5 h-5" />
                Load Template
              </button>
            </div>
          </div>

          {/* Templates Panel */}
          {showTemplates && (
            <WorkflowTemplates onSelectTemplate={loadTemplate} />
          )}

          {/* React Flow Canvas */}
          <div className="flex-1 relative cursor-grab active:cursor-grabbing" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              attributionPosition="bottom-left"
              onInit={(reactFlowInstance) => {
                reactFlowInstance.current = reactFlowInstance;
              }}
              className="bg-gray-50"
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { 
                  strokeWidth: 4,
                  stroke: '#3B82F6'
                },
                markerEnd: {
                  type: 'arrowclosed',
                  width: 20,
                  height: 20,
                  color: '#3B82F6'
                }
              }}
              connectionLineStyle={{ 
                strokeWidth: 4,
                stroke: '#3B82F6'
              }}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              <MiniMap />
              
              {/* ACHAI Logo */}
              <Panel position="bottom-right" className="m-4">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border">
                  <img 
                    src="/aCHAI lOGO.png" 
                    alt="ACHAI" 
                    className="w-8 h-8"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Powered by ACHAI
                  </span>
                </div>
              </Panel>
              {/* Help Panel */}
              {!showTemplates && nodes.length > 0 && (
                <Panel position="top-right" className="m-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border max-w-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">💡 Quick Tips</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>• <strong>Connect steps:</strong> Drag from ⚫ to ⚫</div>
                      <div>• <strong>Move steps:</strong> Drag the ✋ handle</div>
                      <div>• <strong>Configure:</strong> Click anywhere on step</div>
                      <div>• <strong>Delete:</strong> Click 🗑️ button</div>
                    </div>
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Load Template
                    </button>
                  </div>
                </Panel>
              )}
              
              {/* Templates Button (when no nodes) */}
              {!showTemplates && nodes.length === 0 && (
                <Panel position="top-right" className="m-4">
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Templates
                  </button>
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* Right Configuration Panel */}
          {showConfigPanel && selectedNode && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex flex-col h-full">
              <StepConfigurationPanel
                node={selectedNode}
                stepType={selectedNode?.stepType || stepTypes.find(t => t.id === selectedNode?.stepType?.id)}
                onUpdateNode={(updatedNodeData) => {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, ...updatedNodeData } }
                        : n
                    )
                  );
                  setSelectedNode({ ...selectedNode, ...updatedNodeData });
                }}
                onDeleteNode={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                  setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                  setShowConfigPanel(false);
                  setSelectedNode(null);
                }}
                onClose={() => {
                  setShowConfigPanel(false);
                  setSelectedNode(null);
                }}
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
                onKeysUpdated={() => {
                  // Refresh API key status
                  const checkApiKeys = () => {
                    const status = {};
                    const services = ['openai', 'resend', 'sendgrid', 'mailgun'];
                    
                    for (const service of services) {
                      try {
                        const key = apiKeyManager.getKey(service);
                        status[service] = key ? apiKeyManager.validateKey(service, key) : false;
                      } catch {
                        status[service] = false;
                      }
                    }
                    
                    setApiKeyStatus(status);
                  };
                  
                  checkApiKeys();
                }}
              />
            </div>
          )}
        </div>

        {/* Execution Log */}
        {(isRunning || executionLog.length > 0) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 max-h-48 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Execution Log</h3>
            <div className="space-y-1 font-mono text-sm">
              {executionLog.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 ${
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'success' ? 'text-green-600' :
                    'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs opacity-60">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

// Configuration Panel Component
const StepConfigurationPanel = ({ node, stepType, onUpdateNode, onDeleteNode, onClose, apiKeyStatus }) => {
  const [config, setConfig] = useState(node?.config || {});
  const [label, setLabel] = useState(node?.label || '');

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateNode({ config: newConfig });
  };

  const updateLabel = (newLabel) => {
    setLabel(newLabel);
    onUpdateNode({ label: newLabel });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configure Step</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onDeleteNode}
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

        {/* Step Type Badge */}
        <div 
          className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: stepType?.color || '#6B7280' }}
        >
          {stepType?.icon} {stepType?.name || 'Unknown Step'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Step Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Step Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="Enter step name..."
          />
        </div>

        {/* API Key Requirements */}
        {(stepType?.id === 'ai_analysis' || stepType?.id === 'ai_content') && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">OpenAI API Key Required</span>
            </div>
            <div className="flex items-center gap-2">
              {apiKeyStatus.openai ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm ${apiKeyStatus.openai ? 'text-green-600' : 'text-red-600'}`}>
                {apiKeyStatus.openai ? 'API Key Configured' : 'API Key Missing'}
              </span>
            </div>
          </div>
        )}

        {stepType?.id === 'email_send' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-blue-600" />
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

        {/* Configuration Fields */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Configuration</h4>
          
          {stepType?.id === 'data_source' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Source URL
              </label>
              <input
                type="url"
                value={config.source_url || ''}
                onChange={(e) => updateConfig('source_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/data"
              />
            </div>
          )}

          {stepType?.id === 'ai_analysis' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Analysis Prompt
              </label>
              <textarea
                value={config.analysis_prompt || ''}
                onChange={(e) => updateConfig('analysis_prompt', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what analysis to perform..."
              />
            </div>
          )}

          {stepType?.id === 'ai_content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Template
                </label>
                <textarea
                  value={config.content_template || ''}
                  onChange={(e) => updateConfig('content_template', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter content template..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Voice
                </label>
                <select
                  value={config.brand_voice || 'professional'}
                  onChange={(e) => updateConfig('brand_voice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          )}

          {stepType?.id === 'email_send' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Service
                </label>
                <select
                  value={config.email_service || 'resend'}
                  onChange={(e) => updateConfig('email_service', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={config.from_email || ''}
                  onChange={(e) => updateConfig('from_email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="noreply@yourcompany.com"
                />
              </div>
            </div>
          )}

          {stepType?.id === 'wait_delay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delay Duration (minutes)
              </label>
              <input
                type="number"
                value={config.delay_minutes || 1}
                onChange={(e) => updateConfig('delay_minutes', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="1440"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium"
          >
            <Save className="w-5 h-5" />
            Save & Close
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// API Keys Panel Component
const ApiKeysPanel = ({ apiKeyStatus, onClose, onKeysUpdated }) => {
  const [keys, setKeys] = useState({
    openai: '',
    resend: '',
    sendgrid: '',
    mailgun: '',
  });

  const [loading, setLoading] = useState(false);

  const saveApiKey = async (service, key) => {
    if (!key || key.trim() === '') {
      alert('Please enter a valid API key');
      return;
    }

    setLoading(true);
    try {
      console.log(`Saving ${service} API key:`, key.substring(0, 10) + '...');
      apiKeyManager.storeKey(service, key, true); // true for persistent storage
      
      // Clear the input after successful save
      setKeys(prev => ({ ...prev, [service]: '' }));
      
      // Show success message
      alert(`${service.toUpperCase()} API key saved successfully!`);
      
      // Update the parent component
      onKeysUpdated && onKeysUpdated();
      
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert(`Failed to save ${service} API key: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(keys).map(([service, key]) => (
          <div key={service}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {service} API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKeys(prev => ({ ...prev, [service]: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && key && !loading) {
                    saveApiKey(service, key);
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${service} API key...`}
              />
              <button
                onClick={() => saveApiKey(service, key)}
                disabled={!key || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {apiKeyStatus[service] ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm ${apiKeyStatus[service] ? 'text-green-600' : 'text-red-600'}`}>
                {apiKeyStatus[service] ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReactFlowWorkflowBuilder;