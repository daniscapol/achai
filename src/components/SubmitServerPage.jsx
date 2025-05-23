import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SubmitServerPage = () => {
  const { t } = useTranslation();
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    githubUrl: '',
    npmUrl: '',
    createdBy: '',
    category: '',
    official: false,
    stars_numeric: 0
  });
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form submission status
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Category options
  const categoryOptions = [
    t('submit.categories.ai_development'),
    t('submit.categories.ai_applications'),
    t('submit.categories.workflow_automation'),
    t('submit.categories.web_integration'),
    t('submit.categories.developer_tools'),
    t('submit.categories.document_processing'),
    t('submit.categories.web_scraping'),
    t('submit.categories.research_knowledge'),
    t('submit.categories.analytics_monitoring'),
    t('submit.categories.vector_databases'),
    t('submit.categories.devops'),
    t('submit.categories.database_management'),
    t('submit.categories.other')
  ];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle file selection for icon upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Only allow image files
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Store the file for later processing
    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would send the data to a backend API
      // For now, we'll simulate a submission by storing in localStorage
      
      // Validate the required fields
      if (!formData.name || !formData.description || !formData.githubUrl) {
        throw new Error('Name, description, and GitHub URL are required fields');
      }
      
      // Get existing submissions from localStorage or create empty array
      const existingSubmissions = JSON.parse(localStorage.getItem('mcp_submissions') || '[]');
      
      // Prepare the image data - either from file upload or URL
      let imageData = formData.image_url;
      if (selectedFile && imagePreview) {
        // Use the data URL as the image source
        imageData = imagePreview;
      }
      
      // Add new submission with timestamp and image data
      const newSubmission = {
        ...formData,
        image_url: imageData, // This could be a URL or a data URL
        id: `submission-${Date.now()}`,
        submittedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('mcp_submissions', JSON.stringify([...existingSubmissions, newSubmission]));
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        image_url: '',
        githubUrl: '',
        npmUrl: '',
        createdBy: '',
        category: '',
        official: false,
        stars_numeric: 0
      });
      setSelectedFile(null);
      setImagePreview(null);
      
      // Show success message
      setSubmitted(true);
      
      // Simulate API delay
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };
  
  // Reset form to submit another MCP
  const handleSubmitAnother = () => {
    setSubmitted(false);
  };
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="my-6">
        <h1 className="text-3xl font-bold text-gray-200">{t('submit.title')}</h1>
        <p className="text-lg text-gray-400 mt-2">{t('submit.description')}</p>
      </div>
      
      {submitted ? (
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="bg-green-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">{t('submit.success.title')}</h2>
            <p className="text-gray-300 mb-6">{t('submit.success.message')}</p>
            <button 
              onClick={handleSubmitAnother} 
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
            >
              {t('submit.success.submit_another')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-700 max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-300 font-medium mb-2">{t('submit.form.server_name')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('submit.form.name_placeholder')}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-300 font-medium mb-2">{t('submit.form.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('submit.form.description_placeholder')}
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label htmlFor="githubUrl" className="block text-gray-300 font-medium mb-2">{t('submit.form.github_url')}</label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('submit.form.github_placeholder')}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="npmUrl" className="block text-gray-300 font-medium mb-2">{t('submit.form.npm_url')}</label>
            <input
              type="url"
              id="npmUrl"
              name="npmUrl"
              value={formData.npmUrl}
              onChange={handleChange}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('submit.form.npm_placeholder')}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">{t('submit.form.logo_image')}</label>
            
            <div className="flex flex-col space-y-4">
              {/* File upload option */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('submit.form.upload_option')}</label>
                <div className="flex space-x-4 items-start">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 p-2 w-full"
                  />
                  {imagePreview && (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-md p-2">
                      <img src={imagePreview} alt={t('submit.form.preview_alt')} className="h-12 w-12 object-contain" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* URL option */}
              <div>
                <label htmlFor="image_url" className="block text-gray-400 text-sm mb-2">
                  {t('submit.form.url_option')}
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  disabled={!!imagePreview}
                  className={`w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    imagePreview ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder={t('submit.form.image_url_placeholder')}
                />
                {imagePreview && (
                  <p className="text-yellow-400 text-xs mt-1">
                    {t('submit.form.url_disabled_message')}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="createdBy" className="block text-gray-300 font-medium mb-2">{t('submit.form.creator')}</label>
            <input
              type="text"
              id="createdBy"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('submit.form.creator_placeholder')}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-300 font-medium mb-2">{t('submit.form.category')}</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">{t('submit.form.select_category')}</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="stars_numeric" className="block text-gray-300 font-medium mb-2">{t('submit.form.github_stars')}</label>
            <input
              type="number"
              id="stars_numeric"
              name="stars_numeric"
              value={formData.stars_numeric}
              onChange={handleChange}
              min="0"
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="official"
                checked={formData.official}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-gray-300">{t('submit.form.official_server')}</span>
            </label>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className={`py-3 px-8 font-semibold rounded-md ${
                submitting
                  ? 'bg-purple-800 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white transition-colors`}
            >
              {submitting ? t('common.submitting') : t('submit.form.submit_button')}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-8 p-6 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-200 mb-4">What happens after submission?</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Our team will review your submission for completeness and relevance</li>
          <li>We'll verify the GitHub repository to ensure it's a valid MCP server</li>
          <li>Once approved, your MCP server will appear in the marketplace</li>
          <li>You'll receive a notification when your submission is approved</li>
        </ul>
      </div>
    </div>
  );
};

export default SubmitServerPage;