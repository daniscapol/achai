import React, { useState, useEffect } from 'react';
import { loadUnifiedData } from '../utils/searchUtils';
import NewsAdminPanel from './NewsAdminPanel';
import EntityEditor from './EntityEditor';
import EntityImagePreview from './EntityImagePreview';
import { addClient } from '../utils/simple-client-fix.js';

// Constants for entity types
const ENTITY_TYPES = {
  SERVER: 'server',
  CLIENT: 'client',
  AI_AGENT: 'ai-agent'
};

// Environment modes
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
};

const EntityManager = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // Entity data state
  const [servers, setServers] = useState([]);
  const [clients, setClients] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState(ENTITY_TYPES.SERVER);
  const [editingEntity, setEditingEntity] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [environment, setEnvironment] = useState(ENVIRONMENTS.PRODUCTION);
  
  // Password is "achai-admin" for demo purposes (keep existing password)
  const correctPassword = "achai-admin";

  // Load all entity data on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllEntityData();
      loadSubmissions();
    }
  }, [isAuthenticated, environment]);

  // Load all entity data from appropriate sources
  const loadAllEntityData = async () => {
    try {
      // Load servers
      const serversData = loadServerData();
      setServers(serversData);
      
      // Load clients
      const clientsData = loadClientData();
      setClients(clientsData);
      
      // Load AI agents
      const aiAgentsData = loadAiAgentData();
      setAiAgents(aiAgentsData);
      
      console.log(`Loaded ${serversData.length} servers, ${clientsData.length} clients, and ${aiAgentsData.length} AI agents`);
    } catch (error) {
      console.error("Error loading entity data:", error);
      setMessage({ type: 'error', content: `Error loading data: ${error.message}` });
    }
  };

  // Load servers from localStorage based on environment
  const loadServerData = () => {
    try {
      const storageKey = environment === ENVIRONMENTS.PRODUCTION 
        ? 'mcp_servers_data' 
        : 'mcp_servers_data_dev';
      
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData.map(server => ({
            ...server,
            type: ENTITY_TYPES.SERVER
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error("Error loading server data:", error);
      return [];
    }
  };

  // Load clients from localStorage based on environment
  const loadClientData = () => {
    try {
      const storageKey = environment === ENVIRONMENTS.PRODUCTION 
        ? 'mcp_clients_data' 
        : 'mcp_clients_data_dev';
      
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData.map(client => ({
            ...client,
            type: ENTITY_TYPES.CLIENT
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error("Error loading client data:", error);
      return [];
    }
  };

  // Load AI agents from localStorage based on environment
  const loadAiAgentData = () => {
    try {
      const storageKey = environment === ENVIRONMENTS.PRODUCTION 
        ? 'ai_agents_data' 
        : 'ai_agents_data_dev';
      
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData.map(agent => ({
            ...agent,
            type: ENTITY_TYPES.AI_AGENT
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error("Error loading AI agent data:", error);
      return [];
    }
  };

  // Load submissions from localStorage
  const loadSubmissions = () => {
    try {
      const storedSubmissions = JSON.parse(localStorage.getItem('mcp_submissions') || '[]');
      setSubmissions(storedSubmissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
      setSubmissions([]);
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage({ type: 'error', content: 'Incorrect password' });
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  // Handle adding a new entity to the appropriate data store
  const handleAddEntity = (entityData) => {
    try {
      // Generate ID if not provided
      const newEntity = {
        ...entityData,
        id: entityData.id || `${entityData.type}-${entityData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      };
      
      // Add to the appropriate data store based on type
      switch (entityData.type) {
        case ENTITY_TYPES.SERVER:
          addServer(newEntity);
          break;
        case ENTITY_TYPES.CLIENT:
          addClient(newEntity);
          break;
        case ENTITY_TYPES.AI_AGENT:
          addAiAgent(newEntity);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityData.type}`);
      }
      
      // Update unified data to ensure categories and filters are updated
      updateUnifiedData();
      
      setMessage({ type: 'success', content: `Added ${entityData.name} successfully!` });
      setIsAddingNew(false);
      setEditingEntity(null);

      // Show added client dialog with options
      if (entityData.type === ENTITY_TYPES.CLIENT) {
        setTimeout(() => showClientAddedDialog(newEntity), 500);
      }
    } catch (error) {
      console.error("Error adding entity:", error);
      setMessage({ type: 'error', content: `Error adding ${entityData.name}: ${error.message}` });
    }
  };

  // Show dialog after client is added
  const showClientAddedDialog = (client) => {
    if (!client) return;

    try {
      const viewAllClientsUrl = `/#/search?type=client&refresh=${Date.now()}`;
      const viewClientUrl = `/#/products/${client.id}`;
      
      // Create modal element
      const modalOverlay = document.createElement('div');
      modalOverlay.style.position = 'fixed';
      modalOverlay.style.top = '0';
      modalOverlay.style.left = '0';
      modalOverlay.style.width = '100%';
      modalOverlay.style.height = '100%';
      modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
      modalOverlay.style.zIndex = '9999';
      modalOverlay.style.display = 'flex';
      modalOverlay.style.alignItems = 'center';
      modalOverlay.style.justifyContent = 'center';
      
      const modalContent = document.createElement('div');
      modalContent.style.backgroundColor = '#2d2d2d';
      modalContent.style.borderRadius = '8px';
      modalContent.style.padding = '24px';
      modalContent.style.maxWidth = '500px';
      modalContent.style.width = '90%';
      modalContent.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
      modalContent.style.border = '1px solid #3d3d3d';
      
      const modalTitle = document.createElement('h3');
      modalTitle.textContent = `Client "${client.name}" Added Successfully!`;
      modalTitle.style.fontSize = '20px';
      modalTitle.style.fontWeight = 'bold';
      modalTitle.style.color = '#fff';
      modalTitle.style.marginBottom = '12px';
      
      const modalMessage = document.createElement('p');
      modalMessage.textContent = 'What would you like to do next?';
      modalMessage.style.fontSize = '16px';
      modalMessage.style.color = '#ddd';
      modalMessage.style.marginBottom = '20px';
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '12px';
      buttonContainer.style.justifyContent = 'flex-end';
      
      // Button to view all clients
      const viewAllButton = document.createElement('button');
      viewAllButton.textContent = 'View All Clients';
      viewAllButton.style.backgroundColor = '#4b5563';
      viewAllButton.style.color = 'white';
      viewAllButton.style.padding = '8px 16px';
      viewAllButton.style.borderRadius = '4px';
      viewAllButton.style.border = 'none';
      viewAllButton.style.cursor = 'pointer';
      viewAllButton.style.fontWeight = '500';
      viewAllButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        window.location.href = viewAllClientsUrl;
      };
      
      // Button to view this client
      const viewDetailButton = document.createElement('button');
      viewDetailButton.textContent = 'View This Client';
      viewDetailButton.style.backgroundColor = '#7c3aed';
      viewDetailButton.style.color = 'white';
      viewDetailButton.style.padding = '8px 16px';
      viewDetailButton.style.borderRadius = '4px';
      viewDetailButton.style.border = 'none';
      viewDetailButton.style.cursor = 'pointer';
      viewDetailButton.style.fontWeight = '500';
      viewDetailButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        window.location.href = viewClientUrl;
      };
      
      // Button to stay on current page
      const stayButton = document.createElement('button');
      stayButton.textContent = 'Stay Here';
      stayButton.style.backgroundColor = 'transparent';
      stayButton.style.color = '#aaa';
      stayButton.style.padding = '8px 16px';
      stayButton.style.borderRadius = '4px';
      stayButton.style.border = '1px solid #555';
      stayButton.style.cursor = 'pointer';
      stayButton.style.fontWeight = '500';
      stayButton.onclick = () => {
        document.body.removeChild(modalOverlay);
      };
      
      // Assemble the modal
      buttonContainer.appendChild(stayButton);
      buttonContainer.appendChild(viewAllButton);
      buttonContainer.appendChild(viewDetailButton);
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(modalMessage);
      modalContent.appendChild(buttonContainer);
      
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
    } catch (e) {
      console.error("Error showing client added dialog:", e);
    }
  };

  // Add a server to the server data store
  const addServer = (serverData) => {
    const updatedServers = [...servers, serverData];
    setServers(updatedServers);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'mcp_servers_data' 
      : 'mcp_servers_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedServers));
  };

  // Add a client to the client data store using the simple-client-fix utility
  const addClientToStore = (clientData) => {
    // Use our updated addClient function from simple-client-fix
    addClient(clientData);
    
    // Update the local state
    const updatedClients = [...clients, clientData];
    setClients(updatedClients);
    
    // Log success
    console.log(`Added client "${clientData.name}" using simple-client-fix`);
  };

  // Add an AI agent to the AI agent data store
  const addAiAgent = (agentData) => {
    const updatedAgents = [...aiAgents, agentData];
    setAiAgents(updatedAgents);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'ai_agents_data' 
      : 'ai_agents_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedAgents));
  };

  // Handle updating an existing entity
  const handleUpdateEntity = (entityData) => {
    try {
      // Update the appropriate data store based on type
      switch (entityData.type) {
        case ENTITY_TYPES.SERVER:
          updateServer(entityData);
          break;
        case ENTITY_TYPES.CLIENT:
          updateClient(entityData);
          break;
        case ENTITY_TYPES.AI_AGENT:
          updateAiAgent(entityData);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityData.type}`);
      }
      
      // Update unified data to ensure categories and filters are updated
      updateUnifiedData();
      
      setMessage({ type: 'success', content: `Updated ${entityData.name} successfully!` });
      setEditingEntity(null);
    } catch (error) {
      console.error("Error updating entity:", error);
      setMessage({ type: 'error', content: `Error updating ${entityData.name}: ${error.message}` });
    }
  };

  // Update a server in the server data store
  const updateServer = (serverData) => {
    const updatedServers = servers.map(server => 
      server.id === serverData.id ? serverData : server
    );
    setServers(updatedServers);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'mcp_servers_data' 
      : 'mcp_servers_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedServers));
  };

  // Update a client in the client data store
  const updateClient = (clientData) => {
    // Use the same addClient function to update
    addClient(clientData);
    
    // Update the local state
    const updatedClients = clients.map(client => 
      client.id === clientData.id ? clientData : client
    );
    setClients(updatedClients);
    
    console.log(`Updated client "${clientData.name}" using simple-client-fix`);
  };

  // Update an AI agent in the AI agent data store
  const updateAiAgent = (agentData) => {
    const updatedAgents = aiAgents.map(agent => 
      agent.id === agentData.id ? agentData : agent
    );
    setAiAgents(updatedAgents);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'ai_agents_data' 
      : 'ai_agents_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedAgents));
  };

  // Handle deleting an entity
  const handleDeleteEntity = (entityId, entityType) => {
    try {
      // Remove from the appropriate data store based on type
      switch (entityType) {
        case ENTITY_TYPES.SERVER:
          deleteServer(entityId);
          break;
        case ENTITY_TYPES.CLIENT:
          deleteClient(entityId);
          break;
        case ENTITY_TYPES.AI_AGENT:
          deleteAiAgent(entityId);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      // Update unified data to ensure categories and filters are updated
      updateUnifiedData();
      
      setMessage({ type: 'success', content: `Deleted entity successfully!` });
      
      // Reset editing state if we were editing this entity
      if (editingEntity && editingEntity.id === entityId) {
        setEditingEntity(null);
      }
    } catch (error) {
      console.error("Error deleting entity:", error);
      setMessage({ type: 'error', content: `Error deleting entity: ${error.message}` });
    }
  };

  // Delete a server from the server data store
  const deleteServer = (serverId) => {
    const updatedServers = servers.filter(server => server.id !== serverId);
    setServers(updatedServers);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'mcp_servers_data' 
      : 'mcp_servers_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedServers));
  };

  // Delete a client from the client data store
  const deleteClient = (clientId) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'mcp_clients_data' 
      : 'mcp_clients_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedClients));
    
    // Also update the updated version
    if (environment === ENVIRONMENTS.PRODUCTION) {
      localStorage.setItem('mcp_clients_data_updated', JSON.stringify(updatedClients));
    }
  };

  // Delete an AI agent from the AI agent data store
  const deleteAiAgent = (agentId) => {
    const updatedAgents = aiAgents.filter(agent => agent.id !== agentId);
    setAiAgents(updatedAgents);
    
    // Save to localStorage
    const storageKey = environment === ENVIRONMENTS.PRODUCTION 
      ? 'ai_agents_data' 
      : 'ai_agents_data_dev';
    
    localStorage.setItem(storageKey, JSON.stringify(updatedAgents));
  };

  // Update unified data for search indexing and categories
  const updateUnifiedData = () => {
    try {
      // Load all data directly from storage to ensure we have the most up-to-date data
      let updatedServers = loadServerData();
      let updatedClients = loadClientData();
      let updatedAgents = loadAiAgentData();
      
      // Combine all entity data
      const allData = [
        ...updatedServers,
        ...updatedClients,
        ...updatedAgents
      ];
      
      // Generate categories from entity data
      const categoryMap = new Map();
      
      allData.forEach(entity => {
        const category = entity.category || 'Uncategorized';
        // Create slug consistently
        const slug = category.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/&/g, 'and')
          .replace(/[^\w-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (categoryMap.has(slug)) {
          categoryMap.set(slug, {
            ...categoryMap.get(slug),
            count: categoryMap.get(slug).count + 1,
            originalForms: [...new Set([...categoryMap.get(slug).originalForms, category])]
          });
        } else {
          categoryMap.set(slug, {
            id: slug,
            name: category,
            slug: slug,
            count: 1,
            type: 'category',
            description: `Collection of ${category} items`,
            originalForms: [category]
          });
        }
      });
      
      // Create the full unified data with categories
      const unified = [
        ...allData,
        ...Array.from(categoryMap.values())
      ];
      
      // Save to localStorage for the search system to use
      localStorage.setItem('mcp_unified_data', JSON.stringify(unified));
      
      // Update specific data collections for direct access
      localStorage.setItem('mcp_servers_data', JSON.stringify(updatedServers));
      localStorage.setItem('mcp_clients_data', JSON.stringify(updatedClients));
      localStorage.setItem('mcp_clients_data_updated', JSON.stringify(updatedClients));
      localStorage.setItem('ai_agents_data', JSON.stringify(updatedAgents));
      
      // Also update the combined data for backwards compatibility
      localStorage.setItem('mcp_servers_data_combined', JSON.stringify(allData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('mcp_data_updated', {
        detail: { timestamp: new Date().toISOString() }
      }));
      
      console.log(`EntityManager: Updated unified data with ${unified.length} items`);
      
      return true;
    } catch (error) {
      console.error("EntityManager: Error updating unified data:", error);
      return false;
    }
  };

  // Handle approving a submission to add it to the appropriate data store
  const handleApproveSubmission = (submission) => {
    try {
      // Format the submission to match our data structure
      const newEntity = {
        name: submission.name,
        description: submission.description,
        image_url: submission.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(submission.name)}&background=random`,
        stars_numeric: Number(submission.stars_numeric) || 0,
        category: submission.category || "Other",
        githubUrl: submission.githubUrl,
        npmUrl: submission.npmUrl || "#",
        createdBy: submission.createdBy || "Community Contributor",
        official: submission.official || false,
        id: `${submission.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: ENTITY_TYPES.SERVER // Default to server type for backward compatibility
      };
      
      // Add the entity to the appropriate data store
      handleAddEntity(newEntity);
      
      // Remove from submissions
      handleRejectSubmission(submission);
      
      setMessage({ type: 'success', content: `Added ${submission.name} to marketplace successfully!` });
    } catch (error) {
      console.error("Error approving submission:", error);
      setMessage({ type: 'error', content: `Error adding ${submission.name} to marketplace: ${error.message}` });
    }
  };

  // Handle rejecting a submission
  const handleRejectSubmission = (submission) => {
    // Remove from submissions
    const updatedSubmissions = submissions.filter(s => s.id !== submission.id);
    setSubmissions(updatedSubmissions);
    localStorage.setItem('mcp_submissions', JSON.stringify(updatedSubmissions));
    setMessage({ type: 'success', content: `Rejected ${submission.name}` });
  };

  // Get current entities based on active tab
  const getCurrentEntities = () => {
    switch (activeTab) {
      case ENTITY_TYPES.SERVER:
        return servers;
      case ENTITY_TYPES.CLIENT:
        return clients;
      case ENTITY_TYPES.AI_AGENT:
        return aiAgents;
      default:
        return [];
    }
  };

  // Filter entities based on search term
  const getFilteredEntities = () => {
    const entities = getCurrentEntities();
    
    if (!searchTerm) {
      return entities;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return entities.filter(entity => 
      (entity.name && entity.name.toLowerCase().includes(lowerSearchTerm)) ||
      (entity.description && entity.description.toLowerCase().includes(lowerSearchTerm)) ||
      (entity.category && entity.category.toLowerCase().includes(lowerSearchTerm)) ||
      (entity.tags && Array.isArray(entity.tags) && 
       entity.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm)))
    );
  };

  // Login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <div className="my-6">
          <h1 className="text-3xl font-bold text-gray-200">Admin Panel</h1>
          <p className="text-lg text-gray-400 mt-2">Please authenticate to access the admin panel.</p>
        </div>
        
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700 max-w-md mx-auto">
          {message && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
              {message.content}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-300 font-medium mb-2">Admin Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter password"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-6 font-semibold rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main admin interface when authenticated
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold text-gray-200">AchAI Admin Panel</h1>
        <div className="flex items-center space-x-4">
          {/* Environment toggle */}
          <div className="flex items-center bg-zinc-800 p-1 rounded-lg">
            <span className="text-sm text-gray-400 mr-2">Environment:</span>
            <button
              onClick={() => setEnvironment(ENVIRONMENTS.DEVELOPMENT)}
              className={`py-1 px-3 rounded-md text-sm font-medium transition-colors ${
                environment === ENVIRONMENTS.DEVELOPMENT 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Development
            </button>
            <button
              onClick={() => setEnvironment(ENVIRONMENTS.PRODUCTION)}
              className={`py-1 px-3 rounded-md text-sm font-medium transition-colors ${
                environment === ENVIRONMENTS.PRODUCTION 
                  ? 'bg-green-600 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Production
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="py-2 px-4 font-semibold rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Status message */}
      {message && (
        <div 
          className={`bg-${message.type === 'success' ? 'green' : message.type === 'error' ? 'red' : 'blue'}-500/20 
                     border border-${message.type === 'success' ? 'green' : message.type === 'error' ? 'red' : 'blue'}-500 
                     text-${message.type === 'success' ? 'green' : message.type === 'error' ? 'red' : 'blue'}-300 
                     p-4 rounded-md mb-6`}
        >
          {message.content}
        </div>
      )}
      
      {/* Entity management tabs */}
      <div className="bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden mb-8">
        <div className="flex border-b border-zinc-700">
          <button 
            className={`px-4 py-3 font-medium ${
              activeTab === ENTITY_TYPES.SERVER 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-zinc-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
            }`}
            onClick={() => setActiveTab(ENTITY_TYPES.SERVER)}
          >
            MCP Servers ({servers.length})
          </button>
          <button 
            className={`px-4 py-3 font-medium ${
              activeTab === ENTITY_TYPES.CLIENT 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-zinc-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
            }`}
            onClick={() => setActiveTab(ENTITY_TYPES.CLIENT)}
          >
            MCP Clients ({clients.length})
          </button>
          <button 
            className={`px-4 py-3 font-medium ${
              activeTab === ENTITY_TYPES.AI_AGENT 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-zinc-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
            }`}
            onClick={() => setActiveTab(ENTITY_TYPES.AI_AGENT)}
          >
            AI Agents ({aiAgents.length})
          </button>
        </div>
        
        <div className="p-6">
          {/* Search and actions bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}s...`}
                className="w-full py-2 pl-8 pr-4 bg-zinc-900 border border-zinc-700 rounded-md text-white"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={() => {
                setIsAddingNew(true);
                setEditingEntity({
                  type: activeTab,
                  name: '',
                  description: '',
                  category: '',
                  // Set default values appropriate for the entity type
                  ...(activeTab === ENTITY_TYPES.SERVER ? { official: false, stars_numeric: 0 } : {}),
                  ...(activeTab === ENTITY_TYPES.CLIENT ? { platforms: [], programmingLanguage: '' } : {}),
                  ...(activeTab === ENTITY_TYPES.AI_AGENT ? { language: '', shortDescription: '' } : {}),
                });
              }}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New {activeTab === ENTITY_TYPES.SERVER ? 'Server' : activeTab === ENTITY_TYPES.CLIENT ? 'Client' : 'AI Agent'}
            </button>
          </div>
          
          {/* Entity table */}
          {!editingEntity && !isAddingNew && (
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-zinc-700">
                  <tr>
                    <th className="text-left p-3 text-gray-300 font-medium w-64">Name</th>
                    <th className="text-left p-3 text-gray-300 font-medium">Description</th>
                    <th className="text-left p-3 text-gray-300 font-medium w-32">Category</th>
                    <th className="text-left p-3 text-gray-300 font-medium w-24">Rating</th>
                    <th className="text-right p-3 text-gray-300 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {getFilteredEntities().length > 0 ? (
                    getFilteredEntities().map((entity) => (
                      <tr key={entity.id} className="hover:bg-zinc-700/30">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 mr-3 rounded-md overflow-hidden bg-zinc-700 flex-shrink-0">
                              <EntityImagePreview 
                                src={entity.local_image_path} 
                                alt={entity.name}
                                entityName={entity.name}
                                size="sm"
                              />
                            </div>
                            <div className="font-medium text-white truncate">{entity.name}</div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300 truncate">{entity.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-zinc-700 text-gray-300 rounded-full text-xs">
                            {entity.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">{entity.stars_numeric || 0}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setEditingEntity(entity)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${entity.name}?`)) {
                                handleDeleteEntity(entity.id, entity.type);
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        {searchTerm 
                          ? `No ${activeTab}s found matching "${searchTerm}"`
                          : `No ${activeTab}s found. Add your first one!`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Edit/Add entity form with EntityEditor component */}
          {(editingEntity || isAddingNew) && (
            <div className="border border-zinc-700 rounded-lg p-6 bg-zinc-900/50">
              <EntityEditor 
                entity={editingEntity}
                isNew={isAddingNew}
                entityType={activeTab}
                onSave={(entityData) => {
                  if (isAddingNew) {
                    handleAddEntity(entityData);
                  } else {
                    handleUpdateEntity(entityData);
                  }
                }}
                onCancel={() => {
                  setEditingEntity(null);
                  setIsAddingNew(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Server Submissions Panel */}
      <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">MCP Server Submissions</h2>
        
        {submissions.length === 0 ? (
          <p className="text-gray-400">No pending submissions found.</p>
        ) : (
          <div className="space-y-6">
            {submissions.map(submission => (
              <div key={submission.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold text-gray-100">{submission.name}</h3>
                  <span className="text-xs text-gray-400">Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-300 mt-2">{submission.description}</p>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400">GitHub URL:</span> 
                    <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">{submission.githubUrl}</a>
                  </div>
                  
                  {submission.npmUrl && (
                    <div>
                      <span className="text-gray-400">NPM URL:</span> 
                      <a href={submission.npmUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">{submission.npmUrl}</a>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-400">Category:</span> 
                    <span className="text-gray-300 ml-1">{submission.category || "Not specified"}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Creator:</span> 
                    <span className="text-gray-300 ml-1">{submission.createdBy || "Not specified"}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Stars:</span> 
                    <span className="text-gray-300 ml-1">{submission.stars_numeric || 0}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Official:</span> 
                    <span className="text-gray-300 ml-1">{submission.official ? "Yes" : "No"}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleApproveSubmission(submission)}
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
                  >
                    Approve & Add
                  </button>
                  <button
                    onClick={() => handleRejectSubmission(submission)}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* News Admin Panel - keeping existing functionality */}
      <div className="mt-8">
        <NewsAdminPanel />
      </div>
    </div>
  );
};

export default EntityManager;