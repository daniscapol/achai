import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, BookOpen, Clock, Star } from 'lucide-react';

const TutorialsManagement = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [categories, setCategories] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    featured_image_url: '',
    category: 'AI Development',
    difficulty_level: 'Beginner',
    estimated_reading_time: 5,
    author_name: 'AchaAI Team',
    author_email: '',
    author_avatar_url: '',
    meta_title: '',
    meta_description: '',
    is_featured: false,
    is_published: true,
    tags: [],
    prerequisites: [],
    learning_outcomes: []
  });

  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const defaultCategories = [
    'AI Development', 'MCP Servers', 'Web Integration', 'Database Management',
    'Automation', 'APIs', 'Machine Learning', 'Data Analysis', 'General'
  ];

  useEffect(() => {
    fetchTutorials();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchTutorials = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort: 'created_at',
        order: 'DESC'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`${API_BASE_URL}/tutorials?${params}`);
      const data = await response.json();
      
      setTutorials(data.tutorials || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tutorials/categories`);
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTutorial 
        ? `${API_BASE_URL}/tutorials/${editingTutorial.id}`
        : `${API_BASE_URL}/tutorials`;
      
      const method = editingTutorial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.filter(tag => tag.trim() !== ''),
          prerequisites: formData.prerequisites.filter(req => req.trim() !== ''),
          learning_outcomes: formData.learning_outcomes.filter(outcome => outcome.trim() !== '')
        })
      });

      if (response.ok) {
        fetchTutorials();
        resetForm();
        alert(editingTutorial ? 'Tutorial updated successfully!' : 'Tutorial created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to save tutorial'}`);
      }
    } catch (error) {
      console.error('Error saving tutorial:', error);
      alert('Error saving tutorial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      ...tutorial,
      tags: tutorial.tags || [],
      prerequisites: tutorial.prerequisites || [],
      learning_outcomes: tutorial.learning_outcomes || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tutorials/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTutorials();
        alert('Tutorial deleted successfully!');
      } else {
        alert('Error deleting tutorial');
      }
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      alert('Error deleting tutorial');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      featured_image_url: '',
      category: 'AI Development',
      difficulty_level: 'Beginner',
      estimated_reading_time: 5,
      author_name: 'AchaAI Team',
      author_email: '',
      author_avatar_url: '',
      meta_title: '',
      meta_description: '',
      is_featured: false,
      is_published: true,
      tags: [],
      prerequisites: [],
      learning_outcomes: []
    });
    setEditingTutorial(null);
    setShowForm(false);
  };

  const handleArrayInput = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tutorials Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Tutorial
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {(categories.length > 0 ? categories : defaultCategories).map(cat => (
              <option key={cat.name || cat} value={cat.name || cat}>
                {cat.name || cat} {cat.count && `(${cat.count})`}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Tutorials List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4">Loading tutorials...</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tutorial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tutorials.map((tutorial) => (
                    <tr key={tutorial.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {tutorial.featured_image_url && (
                            <img
                              src={tutorial.featured_image_url}
                              alt={tutorial.title}
                              className="h-10 w-10 rounded object-cover mr-3"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{tutorial.title}</div>
                            <div className="text-sm text-gray-400">{tutorial.author_name}</div>
                            <div className="text-xs text-gray-500">{formatDate(tutorial.created_at)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tutorial.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty_level)}`}>
                          {tutorial.difficulty_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {tutorial.view_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tutorial.estimated_reading_time || 5}m
                          </div>
                          {tutorial.rating_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {tutorial.rating_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tutorial.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tutorial.is_published ? 'Published' : 'Draft'}
                          </span>
                          {tutorial.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(tutorial)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tutorial.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-slate-800 rounded-lg text-white">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Tutorial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTutorial ? 'Edit Tutorial' : 'Add New Tutorial'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_reading_time}
                    onChange={(e) => setFormData({ ...formData, estimated_reading_time: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Featured Tutorial</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Published</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-600">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingTutorial ? 'Update Tutorial' : 'Create Tutorial')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialsManagement; 