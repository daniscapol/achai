import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Save, Eye, Globe, Plus, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const MultilingualProductEditor = ({ 
  productId = null, 
  onSave = () => {}, 
  onCancel = () => {},
  initialData = null 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    // English fields
    name_en: '',
    description_en: '',
    
    // Portuguese fields  
    name_pt: '',
    description_pt: '',
    
    // Common fields
    price: 0,
    image_url: '',
    icon_url: '',
    category: '',
    product_type: 'mcp_server',
    github_url: '',
    docs_url: '',
    demo_url: '',
    language: '',
    license: '',
    creator: '',
    version: '',
    installation_command: '',
    tags: [],
    is_featured: false,
    is_active: true,
    language_code: 'multi'
  });
  
  const [activeTab, setActiveTab] = useState('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags : []
      }));
    } else if (productId) {
      loadProduct();
    }
  }, [productId, initialData]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/product?id=${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load product');
      }
      
      const product = await response.json();
      setFormData(prev => ({
        ...prev,
        ...product,
        tags: Array.isArray(product.tags) ? product.tags : []
      }));
    } catch (err) {
      setError('Failed to load product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name_en?.trim()) {
      errors.push('English name is required');
    }
    
    if (!formData.description_en?.trim()) {
      errors.push('English description is required');
    }
    
    if (!formData.category?.trim()) {
      errors.push('Category is required');
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const url = productId 
        ? `${API_BASE_URL}/product?id=${productId}`
        : `${API_BASE_URL}/products`;
      
      const method = productId ? 'PUT' : 'POST';
      
      // Generate slug if creating new product
      if (!productId && !formData.slug) {
        formData.slug = formData.name_en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      const savedProduct = await response.json();
      onSave(savedProduct);
      
    } catch (err) {
      setError('Failed to save product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderLanguageTab = (language, langCode) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`name_${langCode}`}>
          {t(`admin.product.name_${langCode}`, `Product Name (${language})`)}
        </Label>
        <Input
          id={`name_${langCode}`}
          value={formData[`name_${langCode}`] || ''}
          onChange={(e) => handleInputChange(`name_${langCode}`, e.target.value)}
          placeholder={t(`admin.product.name_${langCode}_placeholder`, `Enter product name in ${language}`)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor={`description_${langCode}`}>
          {t(`admin.product.description_${langCode}`, `Description (${language})`)}
        </Label>
        <Textarea
          id={`description_${langCode}`}
          value={formData[`description_${langCode}`] || ''}
          onChange={(e) => handleInputChange(`description_${langCode}`, e.target.value)}
          placeholder={t(`admin.product.description_${langCode}_placeholder`, `Enter detailed description in ${language}`)}
          rows={6}
          className="mt-1"
        />
      </div>

      {/* Preview section */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        >
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            {t('admin.product.preview')} ({language})
          </h4>
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-bold mb-2">
              {formData[`name_${langCode}`] || t('admin.product.untitled')}
            </h3>
            <p className="text-gray-600 text-sm">
              {formData[`description_${langCode}`] || t('admin.product.no_description')}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p>{t('admin.product.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {productId 
            ? t('admin.product.edit_multilingual') 
            : t('admin.product.create_multilingual')
          }
          <Badge variant="secondary" className="ml-2">
            {formData.language_code || 'multi'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Language Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en" className="flex items-center gap-2">
              🇺🇸 English
            </TabsTrigger>
            <TabsTrigger value="pt" className="flex items-center gap-2">
              🇧🇷 Português
            </TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="mt-4">
            {renderLanguageTab('English', 'en')}
          </TabsContent>

          <TabsContent value="pt" className="mt-4">
            {renderLanguageTab('Portuguese', 'pt')}
          </TabsContent>
        </Tabs>

        {/* Common fields */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            {t('admin.product.common_fields')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">
                {t('admin.product.category')} *
              </Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder={t('admin.product.category_placeholder')}
              />
            </div>

            <div>
              <Label htmlFor="product_type">
                {t('admin.product.product_type')}
              </Label>
              <select
                id="product_type"
                value={formData.product_type || 'mcp_server'}
                onChange={(e) => handleInputChange('product_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="mcp_server">MCP Server</option>
                <option value="mcp_client">MCP Client</option>
                <option value="ai_agent">AI Agent</option>
                <option value="custom-product">Custom Product</option>
              </select>
            </div>

            <div>
              <Label htmlFor="price">
                {t('admin.product.price')}
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="creator">
                {t('admin.product.creator')}
              </Label>
              <Input
                id="creator"
                value={formData.creator || ''}
                onChange={(e) => handleInputChange('creator', e.target.value)}
                placeholder={t('admin.product.creator_placeholder')}
              />
            </div>

            <div>
              <Label htmlFor="github_url">
                {t('admin.product.github_url')}
              </Label>
              <Input
                id="github_url"
                value={formData.github_url || ''}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div>
              <Label htmlFor="image_url">
                {t('admin.product.image_url')}
              </Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="/assets/images/product.png"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="tags">
              {t('admin.product.tags')}
            </Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder={t('admin.product.tags_placeholder')}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t('admin.product.tags_help')}
            </p>
          </div>

          <div className="mt-4">
            <Label htmlFor="installation_command">
              {t('admin.product.installation_command')}
            </Label>
            <Textarea
              id="installation_command"
              value={formData.installation_command || ''}
              onChange={(e) => handleInputChange('installation_command', e.target.value)}
              placeholder="npm install package-name"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="mr-2"
              />
              {t('admin.product.is_featured')}
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="mr-2"
              />
              {t('admin.product.is_active')}
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {preview ? t('admin.product.hide_preview') : t('admin.product.show_preview')}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              {t('admin.product.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('admin.product.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t('admin.product.save')}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultilingualProductEditor;