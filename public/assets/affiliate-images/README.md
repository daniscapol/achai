# Affiliate Products Data Structure

This directory contains data for the affiliate products featured in the ReadyToUsePage component. The data is structured for easy integration with the site's search functionality.

## Data Location

- Main data file: `/assets/affiliate-images/affiliate_products_data.json`
- Individual product data: 
  - `/assets/affiliate-images/rytr/rytr_data.json`
  - (Add more individual product data files as needed)

## Data Structure

Each product object contains the following fields:

```json
{
  "id": "product-id",
  "name": "Product Name",
  "description": "Detailed product description",
  "shortDescription": "Short product description",
  "tagline": "Product tagline",
  "logoUrl": "/path/to/logo.png",
  "imageUrl": "/path/to/image.jpg",
  "dashboardUrl": "/path/to/dashboard.png",
  "category": "Product Category",
  "affiliateUrl": "https://product-affiliate-link.com",
  "demoUrl": "https://product-demo-link.com",
  "typewriterSentences": ["Sentence 1", "Sentence 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "features": ["Feature 1", "Feature 2"],
  "useCases": ["Use Case 1", "Use Case 2"],
  "pricing": [
    {
      "name": "Plan Name",
      "price": "$XX",
      "features": ["Feature 1", "Feature 2"]
    }
  ],
  "testimonials": [
    {
      "quote": "Testimonial quote",
      "author": "Author Name",
      "company": "Company Name"
    }
  ],
  "stats": [
    {
      "value": 90,
      "label": "Stat Label",
      "suffix": "%"
    }
  ],
  "type": "affiliate_product",
  "keywords": ["keyword1", "keyword2"],
  "searchable": true
}
```

## Using with Search Functionality

To integrate these affiliate products with the site's search functionality:

1. Import the data in your search utility:

```javascript
import affiliateProducts from '../public/assets/affiliate-images/affiliate_products_data.json';

// Add to your searchable content
const searchableContent = [
  ...yourExistingContent,
  ...affiliateProducts
];
```

2. Ensure your search function checks the following fields:
   - name
   - description
   - shortDescription
   - tagline
   - category
   - features
   - useCases
   - keywords

Example search implementation:

```javascript
const searchProducts = (query, products) => {
  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => {
    // Only include searchable products
    if (!product.searchable) return false;
    
    // Check for matches in various fields
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.shortDescription.toLowerCase().includes(searchTerm) ||
      product.tagline.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
      product.useCases.some(useCase => useCase.toLowerCase().includes(searchTerm)) ||
      product.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  });
};
```

3. When displaying search results, you can use the `type` field (set to "affiliate_product") to render these results differently from other content types.

## Adding New Affiliate Products

1. Create a new entry in the `affiliate_products_data.json` file following the structure above
2. Add all required product assets to an appropriate subfolder (e.g., `/assets/affiliate-images/new-product/`)
3. Update any product-specific data in its own JSON file if needed
4. Make sure the `type` is set to "affiliate_product" and `searchable` is set to true
5. Add relevant keywords to improve search discoverability