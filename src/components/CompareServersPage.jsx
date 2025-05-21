import React, { useState, useEffect } from 'react';
import ScrollReveal from './animations/ScrollReveal';
import ParallaxEffect from './animations/ParallaxEffect';

const CompareServersPage = ({ allProductsData, onNavigateToDetail }) => {
  // Convert data to array if needed
  const allProductsArray = Array.isArray(allProductsData) 
    ? allProductsData 
    : Object.values(allProductsData);
  
  const [selectedServers, setSelectedServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for servers
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allProductsArray.filter(product => 
      !selectedServers.some(s => s.id === product.id) && (
        (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) || 
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm)) ||
        (product.category && product.category.toLowerCase().includes(lowerSearchTerm))
      )
    ).slice(0, 5); // Limit to 5 results
    
    setSearchResults(results);
  }, [searchTerm, allProductsArray, selectedServers]);

  // Add server to comparison
  const addServer = (server) => {
    if (selectedServers.length < 3) {
      setSelectedServers([...selectedServers, server]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  // Remove server from comparison
  const removeServer = (serverId) => {
    setSelectedServers(selectedServers.filter(server => server.id !== serverId));
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Hero Section */}
      <ScrollReveal direction="down" threshold={0.1} once={true} duration="normal">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Compare MCP Servers</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compare features, capabilities, and specifications of different MCP servers side by side.
          </p>
        </div>
      </ScrollReveal>

      {/* Selection Area */}
      <ScrollReveal direction="up" threshold={0.1} once={true} duration="normal" delay={100}>
        <div className="mb-12">
          <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700 mb-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Select MCP Servers to Compare</h2>
            <p className="text-gray-300 mb-4">Choose up to 3 MCP servers for detailed comparison.</p>
            
            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                className="w-full p-3 pl-10 bg-zinc-800 border border-zinc-700 rounded-md text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search for an MCP server to compare..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(true);
                }}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                onFocus={() => setIsSearching(true)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Search Results Dropdown */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-700 focus:bg-zinc-700 text-gray-200 flex items-center transition-colors duration-200"
                      onClick={() => addServer(result)}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        animation: 'fadeInDown 0.3s ease forwards'
                      }}
                    >
                      {result.image_url ? (
                        <img src={result.image_url} alt="" className="w-8 h-8 mr-3 rounded object-contain" />
                      ) : (
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold mr-3">
                          {result.name ? result.name.substring(0, 1).toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-400 truncate">{result.description?.substring(0, 60)}...</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Servers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((slot, idx) => {
                const server = selectedServers[slot];
                return (
                  <ScrollReveal key={slot} direction="up" threshold={0.1} delay={200 + idx * 100} once={true}>
                    <ParallaxEffect depth={1} glare={true}>
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex flex-col min-h-[180px] transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
                        {server ? (
                          <>
                            <div className="flex items-start mb-3">
                              <div className="flex-shrink-0 mr-3">
                                {server.image_url ? (
                                  <img src={server.image_url} alt="" className="w-12 h-12 rounded object-contain" />
                                ) : (
                                  <div className="w-12 h-12 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
                                    {server.name ? server.name.substring(0, 1).toUpperCase() : '?'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <h3 className="text-gray-100 font-medium">{server.name}</h3>
                                <p className="text-xs text-gray-400">{server.category}</p>
                              </div>
                              <button 
                                className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                                onClick={() => removeServer(server.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-3 mb-3">{server.description}</p>
                            <button 
                              className="mt-auto text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center"
                              onClick={() => onNavigateToDetail(server.id)}
                            >
                              View Details
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 text-center">
                            <div>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p>Select an MCP server</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ParallaxEffect>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Comparison Table */}
      {selectedServers.length > 0 ? (
        <ScrollReveal direction="up" threshold={0.1} once={true} duration="normal" delay={300}>
          <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Comparison</h2>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-3 text-gray-300 font-medium">Feature</th>
                  {selectedServers.map(server => (
                    <th key={server.id} className="text-left p-3 text-gray-100 font-medium">{server.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={350}>
                  <tr className="border-b border-zinc-700/50">
                    <td className="p-3 text-gray-300 font-medium">Category</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        {server.category || 'Unknown'}
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
                
                {/* Creator Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={400}>
                  <tr className="border-b border-zinc-700/50">
                    <td className="p-3 text-gray-300 font-medium">Created By</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        {server.createdBy || 'Unknown'}
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
                
                {/* Popularity Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={450}>
                  <tr className="border-b border-zinc-700/50">
                    <td className="p-3 text-gray-300 font-medium">Popularity</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        {server.stars ? (
                          <span className="flex items-center text-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {(typeof server.stars === 'number' ? server.stars.toLocaleString() : server.stars)}
                          </span>
                        ) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
                
                {/* Official Status Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={500}>
                  <tr className="border-b border-zinc-700/50">
                    <td className="p-3 text-gray-300 font-medium">Official Status</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        {server.official ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                            Official
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-gray-300">
                            Community
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
                
                {/* Links Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={550}>
                  <tr className="border-b border-zinc-700/50">
                    <td className="p-3 text-gray-300 font-medium">External Links</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {server.githubUrl && (
                            <a 
                              href={server.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-zinc-700 text-gray-200 hover:bg-zinc-600 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              GitHub
                            </a>
                          )}
                          {server.npmUrl && (
                            <a 
                              href={server.npmUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-pink-800 text-white hover:bg-pink-700 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M0 0v24h24v-24h-24zm6.8 6.8h10.4v10.4h-2.6v-7.8h-2.6v7.8h-5.2v-10.4z" />
                              </svg>
                              npm
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
                
                {/* Description Row */}
                <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast" delay={600}>
                  <tr>
                    <td className="p-3 text-gray-300 font-medium">Description</td>
                    {selectedServers.map(server => (
                      <td key={server.id} className="p-3 text-gray-200">
                        {server.description || 'No description available'}
                      </td>
                    ))}
                  </tr>
                </ScrollReveal>
              </tbody>
            </table>
            
            {/* Key Features Section */}
            <ScrollReveal direction="up" threshold={0.1} once={true} duration="normal" delay={650}>
              <h3 className="text-lg font-semibold text-gray-100 mt-8 mb-4">Key Features</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left p-3 text-gray-300 font-medium">Server</th>
                    <th className="text-left p-3 text-gray-100 font-medium">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedServers.map((server, idx) => (
                    <ScrollReveal key={server.id} direction="up" threshold={0.1} once={true} duration="fast" delay={700 + idx * 50}>
                      <tr className="border-b border-zinc-700/50">
                        <td className="p-3 text-gray-300 font-medium">{server.name}</td>
                        <td className="p-3 text-gray-200">
                          {server.keyFeatures && server.keyFeatures.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {server.keyFeatures.map((feature, index) => (
                                <li key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>{feature}</li>
                              ))}
                            </ul>
                          ) : (
                            'No key features listed'
                          )}
                        </td>
                      </tr>
                    </ScrollReveal>
                  ))}
                </tbody>
              </table>
            </ScrollReveal>
            
            {/* Use Cases Section */}
            <ScrollReveal direction="up" threshold={0.1} once={true} duration="normal" delay={750}>
              <h3 className="text-lg font-semibold text-gray-100 mt-8 mb-4">Use Cases</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left p-3 text-gray-300 font-medium">Server</th>
                    <th className="text-left p-3 text-gray-100 font-medium">Use Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedServers.map((server, idx) => (
                    <ScrollReveal key={server.id} direction="up" threshold={0.1} once={true} duration="fast" delay={800 + idx * 50}>
                      <tr className="border-b border-zinc-700/50">
                        <td className="p-3 text-gray-300 font-medium">{server.name}</td>
                        <td className="p-3 text-gray-200">
                          {server.useCases && server.useCases.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {server.useCases.map((useCase, index) => (
                                <li key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>{useCase}</li>
                              ))}
                            </ul>
                          ) : (
                            'No use cases listed'
                          )}
                        </td>
                      </tr>
                    </ScrollReveal>
                  ))}
                </tbody>
              </table>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal direction="up" threshold={0.1} once={true} duration="normal" delay={300}>
          <div className="bg-zinc-800/60 rounded-xl p-8 border border-zinc-700 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Select MCP Servers to Compare</h3>
            <p className="text-gray-300 mb-4 max-w-md mx-auto">Use the search field above to select at least two MCP servers for a detailed side-by-side comparison.</p>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default CompareServersPage;