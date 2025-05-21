import React, { useState, useEffect } from 'react';

const TutorialDetailPage = ({ tutorialId }) => {
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dataStatus, setDataStatus] = useState(null);
  
  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Load the specific tutorial data from API
  useEffect(() => {
    setLoading(true);
    const apiUrl = `/api/tutorials/${tutorialId}`;
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Tutorial not found (status ${response.status})`);
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          setTutorial(data);
          setError(null);
          // Check if there's data status information
          if (data.dataStatus) {
            setDataStatus(data.dataStatus);
          }
        } else {
          setError(`Tutorial with ID "${tutorialId}" not found.`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading tutorial data:", err);
        setError(`Failed to load tutorial data: ${err.message}`);
        setLoading(false);
        
        // Fallback to static data if API fails
        import('../tutorials/tutorials_data.json')
          .then(data => {
            const found = data.default.find(t => 
              t.id === tutorialId || 
              t.slug === tutorialId || 
              t.id === parseInt(tutorialId, 10)
            );
            
            if (found) {
              setTutorial(found);
              setError(null);
              setDataStatus({
                type: 'warning',
                message: 'Using fallback static data: API request failed',
                error: err.message
              });
            }
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error("Error loading fallback tutorial data:", fallbackErr);
          });
      });
  }, [tutorialId]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tutorial...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center max-w-md bg-zinc-800/50 p-8 rounded-lg border border-zinc-700">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="#/tutorials"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            Back to Tutorials
          </a>
        </div>
      </div>
    );
  }
  
  if (!tutorial) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 pb-16 relative">
      {/* Data status alert */}
      {dataStatus && dataStatus.type === 'warning' && (
        <div className="mb-4 bg-yellow-600/20 border border-yellow-600/50 text-yellow-200 py-2 px-4 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>
              {dataStatus.message}
            </span>
          </div>
        </div>
      )}
      
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-50 w-full h-1 bg-zinc-800">
        <div 
          className="h-full bg-purple-500 relative"
          style={{ width: `${scrollProgress}%` }}
        >
          <div className="absolute right-0 top-3 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-80 pointer-events-none">
            {Math.round(scrollProgress)}% complete
          </div>
        </div>
      </div>
      
      {/* Fixed reading time indicator */}
      <div className="fixed bottom-4 right-4 z-50 bg-zinc-800/80 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full border border-zinc-700 shadow-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {tutorial.reading_time}
      </div>
      
      {/* Header section */}
      <div className="mb-8 relative">
        <a 
          href="#/tutorials" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tutorials
        </a>
        
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-8 rounded-lg border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Tutorial image */}
            <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
              {tutorial.image_url ? (
                <img 
                  src={tutorial.image_url} 
                  alt={tutorial.title} 
                  className="w-full rounded-lg border border-zinc-700 shadow-lg object-cover aspect-square"
                />
              ) : (
                <div className="w-full rounded-lg border border-zinc-700 shadow-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center aspect-square">
                  <span className="text-white text-4xl font-bold">{tutorial.title.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {/* Tutorial info */}
            <div className="flex-grow">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{tutorial.title}</h1>
              <p className="text-xl text-gray-300 mb-4">{tutorial.description}</p>
              
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-3 mt-4">
                {tutorial.provider && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-800 text-gray-300 border border-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {tutorial.provider}
                  </span>
                )}
                
                {tutorial.content_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-800 text-gray-300 border border-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {tutorial.content_type}
                  </span>
                )}
                
                {tutorial.reading_time && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-800 text-gray-300 border border-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tutorial.reading_time}
                  </span>
                )}
                
                {tutorial.difficulty && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${
                    tutorial.difficulty === "Beginner" ? "bg-green-900/30 text-green-400 border-green-900" : 
                    tutorial.difficulty === "Intermediate" ? "bg-yellow-900/30 text-yellow-400 border-yellow-900" : 
                    "bg-red-900/30 text-red-400 border-red-900"
                  }`}>
                    {tutorial.difficulty === "Beginner" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : tutorial.difficulty === "Intermediate" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {tutorial.difficulty}
                  </span>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tutorial.tags && tutorial.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full border border-purple-900/50">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {tutorial.source_url && (
                  <a 
                    href={tutorial.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original Document
                  </a>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors duration-300 border border-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial content */}
      <div className="max-w-4xl mx-auto">
        {/* Table of Contents */}
        <div className="mb-8 bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Table of Contents
          </h2>
          <ul className="space-y-1">
            {tutorial.sections && tutorial.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <li key={index}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(`section-${index}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center py-1.5 text-gray-300 hover:text-purple-300 transition-colors duration-200 w-full text-left"
                  >
                    <span className="w-6 text-right mr-2 text-purple-500 font-mono">{index + 1}.</span>
                    {section.title}
                  </button>
                </li>
              ))}
          </ul>
        </div>
        
        {/* Content sections */}
        <div className="space-y-8">
          {tutorial.sections && tutorial.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={index} id={`section-${index}`} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-zinc-700 flex items-start">
                  <span className="text-purple-400 font-mono mr-2">{index + 1}.</span>
                  {section.title}
                </h2>
                <div className="prose prose-invert prose-purple max-w-none">
                  {section.content.split('\n\n').map((paragraph, i) => {
                    // Check if paragraph is a code block (starts with ```bash, ```python, etc.)
                    if (paragraph.startsWith('```')) {
                      const codeStart = paragraph.indexOf('\n');
                      const codeEnd = paragraph.lastIndexOf('```');
                      
                      if (codeStart !== -1 && codeEnd !== -1) {
                        const codeType = paragraph.substring(3, codeStart).trim();
                        const code = paragraph.substring(codeStart + 1, codeEnd);
                        
                        return (
                          <div key={i} className="mb-6">
                            <div className="flex items-center justify-between bg-zinc-800 rounded-t-lg border-t border-l border-r border-zinc-700 px-4 py-2">
                              <div className="flex items-center">
                                {codeType === 'python' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-4 w-4 mr-2 text-blue-400">
                                    <path fill="currentColor" d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"/>
                                  </svg>
                                )}
                                {codeType === 'bash' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-4 w-4 mr-2 text-green-400">
                                    <path fill="currentColor" d="M439.8 200.5L419.1 21.8C418.7 9.1 408.9 0 396.2 0H51.8c-12.7 0-22.5 9.1-22.9 21.8L8.2 200.5c-18.7 269.6 18.7 222.7 82.8 252.4 19.8 19.3 38.9 33.9 59.6 42.4 18.3 7.5 37.5 10.7 57.3 10.7h30c19.8 0 39-3.1 57.3-10.7 20.8-8.5 39.8-23.1 59.6-42.4 64.1-29.7 101.5 17.2 82.8-252.4zM127.5 432c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-17.7 14.3-32 32-32s32 14.3 32 32zm-60-328.4l10.4 149.9c.3 4.3-3.3 7.8-7.6 7.8h-7.7c-4.3 0-7.9-3.5-7.6-7.8l10.4-149.9c.3-4 3.7-7.1 7.6-7.1h-10.7c4 0 7.3 3.1 7.6 7.1zm249.3 218.2c5.5 4.4 5.5 12.4 0 16.8l-22.9 18.3c-1.7 1.4-3.8 2.1-6 2.1-2.2 0-4.3-.7-6-2.1-5.5-4.4-5.5-12.4 0-16.8l17-13.6-17-13.6c-5.5-4.4-5.5-12.4 0-16.8 5.5-4.4 13.7-4.4 19.2 0l22.9 18.3c1.7 1.4 2.6 3.1 2.6 5.1 0 1.9-1 3.7-2.6 5.1zm-90.5 0c5.5 4.4 5.5 12.4 0 16.8l-22.9 18.3c-1.7 1.4-3.8 2.1-6 2.1s-4.3-.7-6-2.1c-5.5-4.4-5.5-12.4 0-16.8l17-13.6-17-13.6c-5.5-4.4-5.5-12.4 0-16.8 5.5-4.4 13.7-4.4 19.2 0l22.9 18.3c1.7 1.4 2.6 3.1 2.6 5.1 0 1.9-.9 3.7-2.6 5.1zm220.8 110.2c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-17.7 14.3-32 32-32s32 14.3 32 32z"/>
                                  </svg>
                                )}
                                <span className="text-sm font-mono text-gray-400">{codeType}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(code);
                                  // You could add a toast notification here
                                }}
                                className="text-gray-400 hover:text-white transition-colors duration-200"
                                title="Copy to clipboard"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              </button>
                            </div>
                            <pre className="bg-zinc-900 rounded-b-lg border-b border-l border-r border-zinc-700 p-4 overflow-x-auto">
                              <code className="text-sm font-mono text-gray-300 whitespace-pre">
                                {code}
                              </code>
                            </pre>
                          </div>
                        );
                      }
                    }
                    
                    // Handle lists (starting with - or 1.)
                    if (paragraph.trim().startsWith('- ') || paragraph.trim().match(/^\d+\.\s/)) {
                      const items = paragraph.split('\n').filter(item => item.trim());
                      const isOrdered = items[0].trim().match(/^\d+\.\s/);
                      
                      return (
                        <div key={i} className="mb-4">
                          {isOrdered ? (
                            <ol className="list-decimal pl-6 space-y-2">
                              {items.map((item, idx) => {
                                // Remove the number prefix from ordered list items
                                const content = item.replace(/^\d+\.\s/, '');
                                // Handle bold text in list items
                                const formattedContent = content.replace(
                                  /\*\*(.*?)\*\*/g, 
                                  '<strong>$1</strong>'
                                );
                                
                                return (
                                  <li 
                                    key={idx} 
                                    className="text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                                  />
                                );
                              })}
                            </ol>
                          ) : (
                            <ul className="list-disc pl-6 space-y-2">
                              {items.map((item, idx) => {
                                // Remove the dash prefix from unordered list items
                                const content = item.replace(/^-\s/, '');
                                // Handle bold text in list items
                                const formattedContent = content.replace(
                                  /\*\*(.*?)\*\*/g, 
                                  '<strong>$1</strong>'
                                );
                                
                                return (
                                  <li 
                                    key={idx} 
                                    className="text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                                  />
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    }
                    
                    // Handle headers (starting with ###)
                    if (paragraph.startsWith('###')) {
                      const headerText = paragraph.replace(/^###\s/, '');
                      return (
                        <h3 key={i} className="text-xl font-bold text-purple-300 mb-3 mt-6">
                          {headerText}
                        </h3>
                      );
                    }
                    
                    // Handle regular paragraphs with bold text
                    const formattedText = paragraph.replace(
                      /\*\*(.*?)\*\*/g, 
                      '<strong>$1</strong>'
                    );
                    
                    return (
                      <p 
                        key={i} 
                        className="mb-4 text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formattedText }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
        {/* Interactive feedback section */}
        <div className="max-w-4xl mx-auto mt-16 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            How helpful was this tutorial?
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((rating) => {
              // Determine if this rating is selected
              const isSelected = tutorial.userRating === rating;
              
              return (
                <button
                  key={rating}
                  onClick={() => {
                    // Submit rating to API
                    fetch(`/api/tutorials/${tutorialId}/rate`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ rating })
                    })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Failed to submit rating');
                      }
                      return response.json();
                    })
                    .then(data => {
                      // Update the local tutorial data with the new rating
                      setTutorial(prevTutorial => ({
                        ...prevTutorial,
                        userRating: rating
                      }));
                    })
                    .catch(err => {
                      console.error('Error submitting rating:', err);
                      // Still update the UI for better user experience even if the API call fails
                      setTutorial(prevTutorial => ({
                        ...prevTutorial,
                        userRating: rating
                      }));
                    });
                  }}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-full 
                    ${isSelected 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-700 hover:bg-purple-600 text-gray-200 hover:text-white'} 
                    transition-colors duration-300`}
                  title={`Rate ${rating} stars`}
                >
                  <span className="text-xl">{rating}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {['Easy to follow', 'Clear explanations', 'Good examples', 'Helpful code snippets', 'Missing information'].map((tag, index) => {
              // Check if this tag is in the user's selected feedback
              const isSelected = tutorial.userFeedback && tutorial.userFeedback.includes(tag);
              
              return (
                <button 
                  key={index}
                  onClick={() => {
                    // Toggle this tag in the user's feedback
                    const newFeedback = tutorial.userFeedback 
                      ? isSelected
                        ? tutorial.userFeedback.filter(item => item !== tag)
                        : [...tutorial.userFeedback, tag]
                      : [tag];
                    
                    // Submit to API
                    fetch(`/api/tutorials/${tutorialId}/feedback`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ feedback: newFeedback })
                    })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Failed to submit feedback');
                      }
                      return response.json();
                    })
                    .then(data => {
                      // Update local state
                      setTutorial(prevTutorial => ({
                        ...prevTutorial,
                        userFeedback: newFeedback
                      }));
                    })
                    .catch(err => {
                      console.error('Error submitting feedback:', err);
                      // Still update UI for better experience
                      setTutorial(prevTutorial => ({
                        ...prevTutorial,
                        userFeedback: newFeedback
                      }));
                    });
                  }}
                  className={`px-4 py-2 rounded-full text-sm
                    ${isSelected 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-700 hover:bg-purple-600 text-gray-200 hover:text-white'} 
                    transition-colors duration-300`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          
          {/* Feedback submission status */}
          {(tutorial.userRating || (tutorial.userFeedback && tutorial.userFeedback.length > 0)) && (
            <div className="mt-4 text-green-400 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Thank you for your feedback!
            </div>
          )}
        </div>
        
        {/* Navigation controls */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <a 
            href="#/tutorials"
            className="inline-flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Tutorials
          </a>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={scrollToTop} 
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialDetailPage;