import React, { useState, useEffect } from 'react';

const TutorialAdminPanel = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form for creating/editing tutorials
  const emptyTutorial = {
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    author: 'AchAI Team',
    category: '',
    difficulty: 'Beginner',
    reading_time: '',
    tags: [],
    is_published: true,
    featured: false,
    sections: []
  };
  
  const [formData, setFormData] = useState(emptyTutorial);
  const [currentSection, setCurrentSection] = useState({ title: '', content: '', order: 0 });
  
  // Fetch tutorials from API
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/tutorials?limit=50');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tutorials: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // Ensure proper data formatting
        const formattedTutorials = (data.tutorials || []).map(tutorial => ({
          ...tutorial,
          // Ensure necessary properties exist and have correct types
          views_count: tutorial.views_count || 0,
          ratings_count: tutorial.ratings_count || 0,
          avg_rating: typeof tutorial.avg_rating === 'number' ? tutorial.avg_rating : 0,
          tags: Array.isArray(tutorial.tags) ? tutorial.tags : (typeof tutorial.tags === 'string' ? tutorial.tags.split(',').map(t => t.trim()) : []),
          is_published: tutorial.is_published !== undefined ? tutorial.is_published : true,
          sections: Array.isArray(tutorial.sections) ? tutorial.sections : []
        }));
        setTutorials(formattedTutorials);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tutorials:', err);
        setError(err.message);
        setLoading(false);
        
        // Fallback to local storage or static data
        try {
          const staticData = await import('../tutorials/tutorials_data.json');
          
          // Ensure the data is properly formatted with all required fields
          const formattedData = (staticData.default || []).map(tutorial => ({
            ...tutorial,
            // Ensure necessary properties exist and have correct types
            views_count: tutorial.views_count || 0,
            ratings_count: tutorial.ratings_count || 0,
            avg_rating: typeof tutorial.avg_rating === 'number' ? tutorial.avg_rating : 0,
            tags: Array.isArray(tutorial.tags) ? tutorial.tags : [],
            is_published: tutorial.is_published !== undefined ? tutorial.is_published : true,
            sections: Array.isArray(tutorial.sections) ? tutorial.sections : []
          }));
          
          setTutorials(formattedData);
          setMessage({
            type: 'warning',
            text: 'Using fallback static data. Database connection failed.'
          });
        } catch (fallbackErr) {
          console.error('Error loading fallback data:', fallbackErr);
        }
      }
    };
    
    fetchTutorials();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Auto-generate slug from title if slug is empty
    if (name === 'title' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };
  
  // Handle tags input
  const handleTagsChange = (e) => {
    const tagsValue = e.target.value;
    const tagsArray = tagsValue.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };
  
  // Handle section input changes
  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setCurrentSection(prev => ({ ...prev, [name]: value }));
  };
  
  // Add section to tutorial
  const addSection = () => {
    if (!currentSection.title || !currentSection.content) {
      setMessage({
        type: 'error',
        text: 'Section title and content are required.'
      });
      return;
    }
    
    // Add the current section to the sections array
    const newSection = {
      ...currentSection,
      order: formData.sections.length + 1 // Ensure order is sequential
    };
    
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    
    // Clear the current section form
    setCurrentSection({ title: '', content: '', order: formData.sections.length + 1 });
    
    setMessage({
      type: 'success',
      text: 'Section added successfully!'
    });
  };
  
  // Remove section from tutorial
  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    
    // Re-number the remaining sections
    const renumberedSections = updatedSections.map((section, i) => ({
      ...section,
      order: i + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      sections: renumberedSections
    }));
    
    setMessage({
      type: 'success',
      text: 'Section removed successfully!'
    });
  };
  
  // Edit an existing section
  const editSection = (index) => {
    setCurrentSection(formData.sections[index]);
    
    // Remove the section from the array (it will be added back when user saves)
    removeSection(index);
  };
  
  // Create new tutorial
  const createTutorial = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.content) {
        setMessage({
          type: 'error',
          text: 'Title, description, and content are required.'
        });
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/tutorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Simple auth for demo
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tutorial');
      }
      
      const newTutorial = await response.json();
      
      // Update the tutorials list
      setTutorials(prev => [newTutorial, ...prev]);
      
      // Reset form
      setFormData(emptyTutorial);
      setCurrentSection({ title: '', content: '', order: 0 });
      setIsEditing(false);
      
      setMessage({
        type: 'success',
        text: 'Tutorial created successfully!'
      });
    } catch (err) {
      console.error('Error creating tutorial:', err);
      setMessage({
        type: 'error',
        text: `Failed to create tutorial: ${err.message}`
      });
    }
  };
  
  // Update existing tutorial
  const updateTutorial = async () => {
    try {
      if (!currentTutorial) {
        return;
      }
      
      // Validate required fields
      if (!formData.title || !formData.description) {
        setMessage({
          type: 'error',
          text: 'Title and description are required.'
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/tutorials/${currentTutorial.id || currentTutorial.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Simple auth for demo
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tutorial');
      }
      
      const updatedTutorial = await response.json();
      
      // Update the tutorials list
      setTutorials(prev => prev.map(t => 
        t.id === updatedTutorial.id ? updatedTutorial : t
      ));
      
      // Reset form and state
      setFormData(emptyTutorial);
      setCurrentSection({ title: '', content: '', order: 0 });
      setCurrentTutorial(null);
      setIsEditing(false);
      
      setMessage({
        type: 'success',
        text: 'Tutorial updated successfully!'
      });
    } catch (err) {
      console.error('Error updating tutorial:', err);
      setMessage({
        type: 'error',
        text: `Failed to update tutorial: ${err.message}`
      });
    }
  };
  
  // Delete tutorial
  const deleteTutorial = async (tutorial) => {
    if (!window.confirm(`Are you sure you want to delete "${tutorial.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/tutorials/${tutorial.id || tutorial.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token' // Simple auth for demo
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tutorial');
      }
      
      // Update the tutorials list
      setTutorials(prev => prev.filter(t => t.id !== tutorial.id));
      
      setMessage({
        type: 'success',
        text: 'Tutorial deleted successfully!'
      });
    } catch (err) {
      console.error('Error deleting tutorial:', err);
      setMessage({
        type: 'error',
        text: `Failed to delete tutorial: ${err.message}`
      });
    }
  };
  
  // Edit tutorial
  const editTutorial = (tutorial) => {
    setCurrentTutorial(tutorial);
    setFormData({
      ...tutorial,
      tags: tutorial.tags || []
    });
    setIsEditing(true);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setCurrentTutorial(null);
    setFormData(emptyTutorial);
    setCurrentSection({ title: '', content: '', order: 0 });
    setIsEditing(false);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      updateTutorial();
    } else {
      createTutorial();
    }
  };
  
  // Filtered tutorials based on search query
  const filteredTutorials = tutorials.filter(tutorial => {
    const query = searchQuery.toLowerCase();
    return (
      (tutorial.title && tutorial.title.toLowerCase().includes(query)) ||
      (tutorial.description && tutorial.description.toLowerCase().includes(query)) ||
      (tutorial.category && tutorial.category.toLowerCase().includes(query)) ||
      (tutorial.tags && Array.isArray(tutorial.tags) && tutorial.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(query)))
    );
  });
  
  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Tutorial Management</h2>
      
      {/* Message display */}
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'error' ? 'bg-red-500/20 border border-red-500 text-red-300' :
          message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-300' :
          'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
        }`}>
          {message.text}
          <button 
            className="float-right" 
            onClick={() => setMessage(null)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Create/Edit form */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            {isEditing ? 'Edit Tutorial' : 'Create New Tutorial'}
          </h3>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="py-1 px-3 text-sm bg-zinc-700 hover:bg-zinc-600 text-gray-200 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
                required
              />
            </div>
            
            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-gray-300 mb-1">Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
                required
              />
            </div>
            
            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-gray-300 mb-1">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-gray-300 mb-1">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
              />
            </div>
            
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-gray-300 mb-1">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            {/* Reading Time */}
            <div>
              <label htmlFor="reading_time" className="block text-gray-300 mb-1">Reading Time</label>
              <input
                type="text"
                id="reading_time"
                name="reading_time"
                value={formData.reading_time}
                onChange={handleInputChange}
                placeholder="e.g. 5 min read"
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
              />
            </div>
            
            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-gray-300 mb-1">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-gray-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
                placeholder="e.g. mcp, servers, setup"
              />
            </div>
          </div>
          
          {/* Flags */}
          <div className="flex space-x-4">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="mr-2"
              />
              Published
            </label>
            
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              Featured
            </label>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-300 mb-1">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200 h-20"
              required
            ></textarea>
          </div>
          
          {/* Main Content */}
          <div>
            <label htmlFor="content" className="block text-gray-300 mb-1">Main Content (Markdown)</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200 h-40 font-mono"
            ></textarea>
          </div>
          
          {/* Sections Management */}
          <div className="border border-zinc-700 rounded p-4">
            <h4 className="text-gray-200 font-semibold mb-3">Tutorial Sections</h4>
            
            {/* Current Sections */}
            {formData.sections.length > 0 && (
              <div className="mb-4">
                <h5 className="text-gray-300 mb-2">Current Sections:</h5>
                <div className="space-y-2">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                      <span className="text-gray-300">
                        {index + 1}. {section.title}
                      </span>
                      <div className="space-x-2">
                        <button 
                          type="button"
                          onClick={() => editSection(index)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeSection(index)}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Section Form */}
            <div className="space-y-3 border-t border-zinc-700 pt-3 mt-3">
              <h5 className="text-gray-300">Add Section:</h5>
              <div>
                <label htmlFor="sectionTitle" className="block text-gray-300 text-sm mb-1">Section Title</label>
                <input
                  type="text"
                  id="sectionTitle"
                  name="title"
                  value={currentSection.title}
                  onChange={handleSectionChange}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
                />
              </div>
              
              <div>
                <label htmlFor="sectionContent" className="block text-gray-300 text-sm mb-1">Section Content (Markdown)</label>
                <textarea
                  id="sectionContent"
                  name="content"
                  value={currentSection.content}
                  onChange={handleSectionChange}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200 h-24 font-mono"
                ></textarea>
              </div>
              
              <button
                type="button"
                onClick={addSection}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Add Section
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
            >
              {isEditing ? 'Update Tutorial' : 'Create Tutorial'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Tutorials List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Tutorials List</h3>
          
          {/* Search Field */}
          <div className="w-1/3">
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-gray-200"
            />
          </div>
        </div>
        
        {loading ? (
          <p className="text-gray-400">Loading tutorials...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : filteredTutorials.length === 0 ? (
          <p className="text-gray-400">No tutorials found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTutorials.map(tutorial => (
              <div key={tutorial.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{tutorial.title}</h3>
                    <p className="text-gray-400 text-sm">{tutorial.slug}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editTutorial(tutorial)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTutorial(tutorial)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 mt-2 line-clamp-2">{tutorial.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutorial.category && (
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-900/50">
                      {tutorial.category}
                    </span>
                  )}
                  
                  {tutorial.difficulty && (
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      tutorial.difficulty === "Beginner" ? "bg-green-900/30 text-green-400 border-green-900" : 
                      tutorial.difficulty === "Intermediate" ? "bg-yellow-900/30 text-yellow-400 border-yellow-900" : 
                      "bg-red-900/30 text-red-400 border-red-900"
                    }`}>
                      {tutorial.difficulty}
                    </span>
                  )}
                  
                  {tutorial.featured && (
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-900/50">
                      Featured
                    </span>
                  )}
                  
                  {!tutorial.is_published && (
                    <span className="px-2 py-1 bg-gray-900/30 text-gray-300 text-xs rounded-full border border-gray-900/50">
                      Draft
                    </span>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-400">
                  <span>{tutorial.views_count || 0} views</span>
                  {tutorial.ratings_count > 0 && (
                    <span className="ml-3">
                      ★ {typeof tutorial.avg_rating === 'number' ? tutorial.avg_rating.toFixed(1) : '0.0'} ({tutorial.ratings_count})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialAdminPanel;