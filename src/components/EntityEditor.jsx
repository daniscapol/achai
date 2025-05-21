import React, { useState, useEffect } from 'react';
import EntityImagePreview from './EntityImagePreview';

// Constants for entity types - ensure consistency with EntityManager
const ENTITY_TYPES = {
  SERVER: 'server',
  CLIENT: 'client',
  AI_AGENT: 'ai-agent'
};

// Common categories for each entity type
const CATEGORIES = {
  [ENTITY_TYPES.SERVER]: [
    'Databases and Storage',
    'Web and Search',
    'Cloud Services',
    'Version Control',
    'Utilities and Files',
    'Communication',
    'Analytics',
    'Security and Auth'
  ],
  [ENTITY_TYPES.CLIENT]: [
    'Desktop Applications',
    'Web Applications',
    'Code Editors',
    'CLI Tools',
    'Libraries',
    'IDE Extensions',
    'Browser Extensions',
    'Messaging Integrations',
    'AI Workflow Tools'
  ],
  [ENTITY_TYPES.AI_AGENT]: [
    'Autonomous Agents',
    'Multi-agent',
    'Task Management',
    'Coding Assistant',
    'Research Assistant',
    'Data Processing',
    'Cognitive Architecture',
    'Agent Building',
    'Creative Studio'
  ]
};

// Available platforms for clients
const CLIENT_PLATFORMS = [
  'Windows',
  'MacOS',
  'Linux',
  'Web',
  'VS Code',
  'JetBrains',
  'Chrome',
  'Firefox',
  'WhatsApp',
  'Slack',
  'Discord',
  'Any'
];

// Programming languages
const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby'
];

// Licenses
const LICENSES = [
  'MIT',
  'Apache 2.0',
  'BSD 3-Clause',
  'GPL v3',
  'LGPL v3',
  'MPL 2.0',
  'Proprietary',
  'Custom'
];

const EntityEditor = ({ 
  entity, 
  isNew = false, 
  onSave, 
  onCancel, 
  entityType = ENTITY_TYPES.SERVER 
}) => {
  // Initialize form state from entity or with defaults
  const [formData, setFormData] = useState({
    id: entity?.id || '',
    name: entity?.name || '',
    description: entity?.description || '',
    category: entity?.category || '',
    image_url: entity?.image_url || '',
    local_image_path: entity?.local_image_path || '',
    githubUrl: entity?.githubUrl || '',
    stars_numeric: entity?.stars_numeric || 0,
    official: entity?.official || false,
    type: entity?.type || entityType,
    tags: entity?.tags || [],
    // Client-specific fields
    platforms: entity?.platforms || [],
    programmingLanguage: entity?.programmingLanguage || '',
    website: entity?.website || '',
    license: entity?.license || '',
    // AI Agent-specific fields
    language: entity?.language || '',
    shortDescription: entity?.shortDescription || '',
    longDescription: entity?.longDescription || ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };
  
  // Handle multi-select changes (for platforms)
  const handleMultiSelectChange = (name, value) => {
    // Check if the value is already selected
    if (formData[name].includes(value)) {
      // Remove it
      setFormData({
        ...formData,
        [name]: formData[name].filter(item => item !== value)
      });
    } else {
      // Add it
      setFormData({
        ...formData,
        [name]: [...formData[name], value]
      });
    }
  };
  
  // Handle tag management
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    // Entity-type specific validations
    if (formData.type === ENTITY_TYPES.CLIENT && formData.platforms.length === 0) {
      newErrors.platforms = 'At least one platform is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Format data based on entity type
    const formattedData = {
      ...formData
    };
    
    // For new entities, generate an ID if not provided
    if (isNew && !formattedData.id) {
      formattedData.id = `${formattedData.type}-${formattedData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }
    
    // For new AI agents, set short description if not provided
    if (isNew && formattedData.type === ENTITY_TYPES.AI_AGENT && !formattedData.shortDescription) {
      formattedData.shortDescription = formattedData.description.substring(0, 150) + 
        (formattedData.description.length > 150 ? '...' : '');
    }
    
    // Set default local image path if not provided
    if (!formattedData.local_image_path) {
      if (formattedData.type === ENTITY_TYPES.SERVER) {
        formattedData.local_image_path = '/assets/server-images/default-server.svg';
      } else if (formattedData.type === ENTITY_TYPES.CLIENT) {
        formattedData.local_image_path = `/assets/client-logos/${formattedData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      } else if (formattedData.type === ENTITY_TYPES.AI_AGENT) {
        formattedData.local_image_path = `/assets/ai-agent-images/${formattedData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      }
    }
    
    // Call the onSave callback with the formatted data
    onSave(formattedData);
  };
  
  // Image upload function with proper filename generation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Create a unique filename based on entity name and type
    const safeName = (formData.name || 'unnamed')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${safeName}-${Date.now().toString().substring(8)}.${fileExt}`;
    
    // Generate appropriate folder path based on entity type
    const folderPath = formData.type === ENTITY_TYPES.SERVER 
      ? 'server-images' 
      : formData.type === ENTITY_TYPES.CLIENT 
        ? 'client-logos' 
        : 'ai-agent-images';
    
    // Create the full path
    const imagePath = `/assets/${folderPath}/${fileName}`;
    
    // In a real implementation, you would upload the file to the server
    // Here we simulate with a timeout and set the path
    setTimeout(() => {
      // Show preview by creating a temporary object URL
      const previewUrl = URL.createObjectURL(file);
      
      // Set both the local path for storage and a temporary preview URL
      setFormData({
        ...formData,
        local_image_path: imagePath,
        _previewUrl: previewUrl // Temporary preview, not stored
      });
      
      setIsUploading(false);
      
      // Alert user about image path
      alert(`In a production environment, the image would be uploaded to: ${imagePath}. For now, please make sure an image exists at this path.`);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Basic Information</h3>
          
          <div>
            <label className="block text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-2 bg-zinc-800 border ${errors.name ? 'border-red-500' : 'border-zinc-700'} rounded-md text-white`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full p-2 bg-zinc-800 border ${errors.description ? 'border-red-500' : 'border-zinc-700'} rounded-md text-white h-32`}
              required
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full p-2 bg-zinc-800 border ${errors.category ? 'border-red-500' : 'border-zinc-700'} rounded-md text-white`}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES[formData.type].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          
          {/* Show other category input if Other is selected */}
          {formData.category === 'Other' && (
            <div>
              <label className="block text-gray-300 mb-1">Custom Category</label>
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  customCategory: e.target.value,
                  category: e.target.value || 'Other'
                })}
                className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                placeholder="Enter custom category"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="official"
              name="official"
              checked={formData.official}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="official" className="text-gray-300">Official {formData.type}</label>
          </div>
        </div>
        
        {/* Details Section - varies by entity type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {formData.type === ENTITY_TYPES.SERVER 
              ? 'Server Details' 
              : formData.type === ENTITY_TYPES.CLIENT 
                ? 'Client Details' 
                : 'AI Agent Details'}
          </h3>
          
          {/* Common fields for all entity types */}
          <div>
            <label className="block text-gray-300 mb-1">GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              placeholder="https://github.com/username/repo"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Stars</label>
            <input
              type="number"
              name="stars_numeric"
              value={formData.stars_numeric}
              onChange={handleNumberChange}
              min="0"
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            />
          </div>
          
          {/* Entity-specific fields */}
          {formData.type === ENTITY_TYPES.CLIENT && (
            <>
              <div>
                <label className="block text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Programming Language</label>
                <select
                  name="programmingLanguage"
                  value={formData.programmingLanguage}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select a language</option>
                  {PROGRAMMING_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">License</label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select a license</option>
                  {LICENSES.map(license => (
                    <option key={license} value={license}>{license}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Platforms</label>
                <div className={`flex flex-wrap gap-2 p-2 bg-zinc-800 border ${
                  errors.platforms ? 'border-red-500' : 'border-zinc-700'
                } rounded-md`}>
                  {CLIENT_PLATFORMS.map(platform => (
                    <div
                      key={platform}
                      onClick={() => handleMultiSelectChange('platforms', platform)}
                      className={`cursor-pointer px-2 py-1 rounded-md text-sm ${
                        formData.platforms.includes(platform)
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      }`}
                    >
                      {platform}
                    </div>
                  ))}
                </div>
                {errors.platforms && <p className="text-red-500 text-sm mt-1">{errors.platforms}</p>}
              </div>
            </>
          )}
          
          {formData.type === ENTITY_TYPES.AI_AGENT && (
            <>
              <div>
                <label className="block text-gray-300 mb-1">Programming Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select a language</option>
                  {PROGRAMMING_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Short Description (for cards)</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="Brief description (max 150 chars)"
                  maxLength={150}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Long Description (for detail page)</label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-32"
                  placeholder="Detailed description"
                ></textarea>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Tags Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Tags</h3>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <div 
              key={tag} 
              className="bg-zinc-700 text-gray-200 px-2 py-1 rounded-md flex items-center"
            >
              <span>{tag}</span>
              <button 
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-gray-400 hover:text-gray-200"
              >
                &times;
              </button>
            </div>
          ))}
          {formData.tags.length === 0 && (
            <span className="text-gray-500 italic">No tags added yet</span>
          )}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-grow p-2 bg-zinc-800 border border-zinc-700 rounded-l-md text-white"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-zinc-700 text-white rounded-r-md hover:bg-zinc-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Image Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Image</h3>
        
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 rounded-md overflow-hidden bg-zinc-700 flex-shrink-0">
            <EntityImagePreview 
              src={formData.local_image_path} 
              alt={formData.name || 'Entity image'} 
              entityName={formData.name}
              size="xl"
            />
          </div>
          
          <div className="flex-grow">
            <label className="block text-gray-300 mb-1">Image Path</label>
            <input
              type="text"
              name="local_image_path"
              value={formData.local_image_path}
              onChange={handleInputChange}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white mb-2"
              placeholder={`/assets/${formData.type === ENTITY_TYPES.SERVER ? 'server-images' : formData.type === ENTITY_TYPES.CLIENT ? 'client-logos' : 'ai-agent-images'}/your-image.png`}
            />
            
            <div className="flex items-center">
              <label className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md px-4 py-2 cursor-pointer transition-colors">
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={isUploading}
                />
              </label>
              <span className="text-gray-400 text-sm ml-3">
                Upload a PNG, JPG, or SVG (MAX: 1MB)
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 mb-1">External Image URL (optional)</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            placeholder="https://example.com/image.png"
          />
          <p className="text-gray-500 text-sm mt-1">
            External URL is used as a fallback if the local image is not found
          </p>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
        >
          {isNew ? 'Add' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EntityEditor;