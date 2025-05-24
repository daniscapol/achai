// Fix Portuguese translations by updating through the API
const API_BASE_URL = 'http://localhost:3001/api';

// Better Portuguese translations for common products
const betterTranslations = {
  'gorila da xita': {
    name_pt: 'Gorila da Xita',
    description_pt: 'Servidor MCP especializado para integração com sistemas de IA, oferecendo funcionalidades avançadas de processamento e comunicação.'
  },
  'Xita': {
    name_pt: 'Xita',
    description_pt: 'Agente de IA avançado projetado para automação de tarefas complexas e integração inteligente com diferentes sistemas.'
  },
  'agente gorila special ops': {
    name_pt: 'Agente Gorila Special Ops',
    description_pt: 'Agente de IA especializado em operações especiais, otimizado para tarefas de alta complexidade e processamento estratégico.'
  }
};

async function fixTranslationsViaAPI() {
  console.log('🌐 Fixing Portuguese translations via API...');
  
  try {
    // Get current products
    const response = await fetch(`${API_BASE_URL}/products?limit=100`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.products || [];
    
    console.log(`📦 Found ${products.length} products to check`);
    
    let fixedCount = 0;
    
    for (const product of products) {
      const name = product.name_en || product.name;
      
      // Check if this product has placeholder Portuguese text
      const hasPlaceholderPt = product.description_pt && (
        product.description_pt.includes('Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude') ||
        product.description_pt.includes('Este cliente MCP foi desenvolvido para integração com Claude AI') ||
        product.description_pt.includes('Este agente de IA foi desenvolvido para integração com Claude AI')
      );
      
      if (hasPlaceholderPt || betterTranslations[name]) {
        let newDescriptionPt;
        
        if (betterTranslations[name]) {
          // Use our better translation
          newDescriptionPt = betterTranslations[name].description_pt;
        } else {
          // Use the original English description instead of placeholder
          newDescriptionPt = product.description_en || product.description;
        }
        
        // Update via API - since we don't have a direct update endpoint,
        // we'll need to work with what we have
        console.log(`🔄 Would fix "${name}": "${newDescriptionPt.substring(0, 50)}..."`);
        fixedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Total products checked: ${products.length}`);
    console.log(`   • Products needing translation fixes: ${fixedCount}`);
    console.log(`   • Products with placeholder Portuguese text found`);
    
    // Show specific examples of placeholder text found
    const placeholders = products.filter(p => 
      p.description_pt && (
        p.description_pt.includes('Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude') ||
        p.description_pt.includes('Este cliente MCP foi desenvolvido para integração com Claude AI') ||
        p.description_pt.includes('Este agente de IA foi desenvolvido para integração com Claude AI')
      )
    );
    
    console.log(`\n🔍 Examples of placeholder text found:`);
    placeholders.slice(0, 3).forEach(product => {
      console.log(`   • "${product.name}": "${product.description_pt.substring(0, 80)}..."`);
    });
    
    console.log(`\n💡 To fix these translations, you need to:`);
    console.log(`   1. Access your database directly`);
    console.log(`   2. Run UPDATE queries to replace placeholder text`);
    console.log(`   3. Or implement an API endpoint for bulk translation updates`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the analysis
fixTranslationsViaAPI();