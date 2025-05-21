import React, { useState, useEffect } from 'react';
import NewsAdminPanel from './NewsAdminPanel';
import TutorialAdminPanel from './TutorialAdminPanel';

const AdminPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('news');

  // Password is "achai-admin" for demo purposes
  // In a real application, you would use proper authentication
  const correctPassword = "achai-admin";

  useEffect(() => {
    if (isAuthenticated) {
      // Load submissions from localStorage
      const storedSubmissions = JSON.parse(localStorage.getItem('mcp_submissions') || '[]');
      setSubmissions(storedSubmissions);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleAddToMarketplace = (submission) => {
    try {
      // Get current marketplace MCP servers
      let currentData = [];
      try {
        // Try to read the current data from localStorage
        const storedData = localStorage.getItem('mcp_servers_data');
        if (storedData) {
          currentData = JSON.parse(storedData);
        } else {
          // If no localStorage data exists yet, try to fetch from the json file
          // Note: This is a client-side workaround. In a real app, you'd have a backend API.
          fetch('/src/mcp_servers_data.json')
            .then(response => response.json())
            .then(data => {
              currentData = data;
              processSubmission();
            })
            .catch(err => {
              console.error("Error loading initial data:", err);
              // Fallback to empty array if both sources fail
              processSubmission();
            });
          return; // Early return to wait for fetch
        }
      } catch (err) {
        console.error("Error reading existing data:", err);
        // Continue with empty array if there's an error
      }
      
      // Process the submission with whatever data we have
      processSubmission();
      
      function processSubmission() {
        // Format the submission to match our data structure
        const newServer = {
          name: submission.name,
          description: submission.description,
          image_url: submission.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(submission.name)}&background=random`,
          stars_numeric: Number(submission.stars_numeric) || 0,
          category: submission.category || "Other",
          githubUrl: submission.githubUrl,
          npmUrl: submission.npmUrl || "#",
          createdBy: submission.createdBy || "Community Contributor",
          official: submission.official || false,
          id: `${submission.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        };
        
        // Add to current data
        currentData.push(newServer);
        
        // Save back to localStorage as an array
        localStorage.setItem('mcp_servers_data', JSON.stringify(currentData));
        
        // Update message
        setMessage(`Added ${submission.name} to marketplace successfully!`);
        
        // Remove from submissions
        const updatedSubmissions = submissions.filter(s => s.id !== submission.id);
        setSubmissions(updatedSubmissions);
        localStorage.setItem('mcp_submissions', JSON.stringify(updatedSubmissions));
      }
    } catch (err) {
      console.error("Error adding to marketplace:", err);
      setMessage(`Error adding ${submission.name} to marketplace: ${err.message}`);
    }
  };

  const handleReject = (submission) => {
    // Remove from submissions
    const updatedSubmissions = submissions.filter(s => s.id !== submission.id);
    setSubmissions(updatedSubmissions);
    localStorage.setItem('mcp_submissions', JSON.stringify(updatedSubmissions));
    setMessage(`Rejected ${submission.name}`);
  };

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
              {message}
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

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold text-gray-200">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 font-semibold rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {message && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-md mb-6">
          {message}
        </div>
      )}
      
      <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
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
                    onClick={() => handleAddToMarketplace(submission)}
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
                  >
                    Approve & Add
                  </button>
                  <button
                    onClick={() => handleReject(submission)}
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
      
      {/* Admin Tab Links */}
      <div className="mt-8 mb-4 border-b border-zinc-700">
        <nav className="flex space-x-6">
          <button 
            onClick={() => setActiveTab('news')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'news' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            News Management
          </button>
          <button 
            onClick={() => setActiveTab('tutorials')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'tutorials' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Tutorials Management
          </button>
        </nav>
      </div>
      
      {/* Active Tab Content */}
      {activeTab === 'news' && (
        <div>
          <NewsAdminPanel />
        </div>
      )}
      
      {activeTab === 'tutorials' && (
        <div>
          <TutorialAdminPanel />
        </div>
      )}
      
      <div className="mt-8 p-6 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Other Admin Actions</h2>
        <p className="text-gray-300">In a full implementation, this panel would have additional features:</p>
        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
          <li>Edit existing MCP servers</li>
          <li>Remove MCP servers from the marketplace</li>
          <li>Manage categories</li>
          <li>View analytics</li>
          <li>Manage user accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;