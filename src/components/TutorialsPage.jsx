import React, { useState, useEffect } from 'react';

const TutorialCard = ({ tutorial }) => {
  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg border border-zinc-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      {/* Tutorial header/image section */}
      <div className="relative h-40 overflow-hidden">
        {tutorial.image_url ? (
          <img 
            src={tutorial.image_url} 
            alt={tutorial.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{tutorial.title.charAt(0)}</span>
          </div>
        )}
        
        {/* Provider badge */}
        {tutorial.provider && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
            {tutorial.provider}
          </div>
        )}
      </div>
      
      {/* Tutorial content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{tutorial.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{tutorial.description}</p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1 mb-3">
          {tutorial.tags && tutorial.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-zinc-700/50 text-gray-300 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
          {tutorial.tags && tutorial.tags.length > 3 && (
            <span className="text-xs bg-zinc-700/50 text-gray-300 px-2 py-1 rounded-full">
              +{tutorial.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Metadata footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-700/50">
          <div className="flex items-center text-xs text-gray-400">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tutorial.reading_time}
            </span>
          </div>
          <div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              tutorial.difficulty === "Beginner" ? "bg-green-900/30 text-green-400" : 
              tutorial.difficulty === "Intermediate" ? "bg-yellow-900/30 text-yellow-400" : 
              "bg-red-900/30 text-red-400"
            }`}>
              {tutorial.difficulty}
            </span>
          </div>
        </div>
      </div>
      
      {/* View button */}
      <div className="p-4 pt-0">
        <a 
          href={`#/tutorials/${tutorial.id}`}
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-md transition-colors duration-300"
        >
          View Tutorial
        </a>
      </div>
    </div>
  );
};

const TutorialsPage = () => {
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  
  // Load tutorials data from API
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        // Import the API service
        const { tutorialApi } = await import('../utils/apiService.js');
        
        // Fetch tutorials data
        const result = await tutorialApi.getTutorials();
        const tutorialsData = result.tutorials || [];
        setTutorials(tutorialsData);
        setFilteredTutorials(tutorialsData);
        
        // Fetch categories
        const categoriesData = await tutorialApi.getTutorialCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(['All', ...categoriesData]);
        }
      } catch (error) {
        console.error("Error fetching tutorials data from API:", error);
        
        // Fallback to static data if API fails
        try {
          const data = await import('../tutorials/tutorials_data.json');
          setTutorials(data.default);
          setFilteredTutorials(data.default);
          
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(data.default.map(t => t.category))];
          setCategories(uniqueCategories);
        } catch (fallbackError) {
          console.error("Error loading fallback tutorials data:", fallbackError);
        }
      }
    };
    
    fetchTutorials();
  }, []);
  
  // Filter tutorials based on search and category
  useEffect(() => {
    const filterTutorials = async () => {
      try {
        // If API is available, use it for filtering
        const { tutorialApi } = await import('../utils/apiService.js');
        
        if (searchTerm.trim()) {
          // Search tutorials via API
          const result = await tutorialApi.searchTutorials(searchTerm);
          let filteredResults = result.tutorials || [];
          
          // Apply category filter if needed
          if (activeCategory !== 'All') {
            filteredResults = filteredResults.filter(tutorial => 
              tutorial.category === activeCategory
            );
          }
          
          setFilteredTutorials(filteredResults);
        } 
        else if (activeCategory !== 'All') {
          // Filter by category via API
          const result = await tutorialApi.filterTutorialsByCategory(activeCategory);
          setFilteredTutorials(result.tutorials || []);
        } 
        else {
          // No filters, use all tutorials
          setFilteredTutorials(tutorials);
        }
      } catch (error) {
        console.error("Error filtering tutorials via API:", error);
        
        // Fallback to client-side filtering if API fails
        let results = tutorials;
        
        // Apply category filter
        if (activeCategory !== 'All') {
          results = results.filter(tutorial => tutorial.category === activeCategory);
        }
        
        // Apply search filter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          results = results.filter(tutorial => 
            tutorial.title.toLowerCase().includes(searchLower) ||
            tutorial.description.toLowerCase().includes(searchLower) ||
            (tutorial.tags && tutorial.tags.some(tag => tag.toLowerCase().includes(searchLower)))
          );
        }
        
        setFilteredTutorials(results);
      }
    };
    
    // Only filter if we have tutorials loaded
    if (tutorials.length > 0) {
      filterTutorials();
    }
  }, [searchTerm, activeCategory, tutorials]);
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Page header */}
      <div className="my-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          AI <span className="text-purple-400">Tutorials & Resources</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Comprehensive guides, tutorials, and documentation to help you master AI tools and techniques.
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto mb-6">
          <input 
            type="text" 
            placeholder="Search tutorials by title, description, or tags..." 
            className="w-full p-4 pl-12 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Clear search button */}
          {searchTerm && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Category filters */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeCategory === category 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results info */}
      <div className="text-gray-400 text-sm mb-4">
        Showing {filteredTutorials.length} {filteredTutorials.length === 1 ? 'tutorial' : 'tutorials'}
        {activeCategory !== 'All' && <span> in {activeCategory}</span>}
        {searchTerm && <span> matching "{searchTerm}"</span>}
      </div>
      
      {/* Tutorials grid */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTutorials.map((tutorial, index) => (
            <TutorialCard key={tutorial.id || index} tutorial={tutorial} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-800/30 rounded-lg border border-zinc-700 mb-12">
          <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-xl mb-4">No tutorials found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('All');
            }}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            Clear filters and try again
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialsPage;