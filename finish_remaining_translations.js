import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

// Additional Portuguese translations for remaining products
const finalTranslations = {
  'GPT Computer Assistant': {
    name_pt: 'Assistente de Computador GPT',
    description_pt: 'Assistente de IA com suporte MCP para tarefas relacionadas ao computador e gerenciamento de sistema.'
  },
  'Goose': {
    name_pt: 'Goose',
    description_pt: 'Ferramenta baseada em extensões com integração MCP para melhoria de produtividade alimentada por IA.'
  },
  'MCP Backup Server': {
    name_pt: 'Servidor de Backup MCP',
    description_pt: 'Fornece capacidades de backup e restauração de arquivos e pastas para agentes de IA e ferramentas de edição de código.'
  },
  'FileSystem (Official)': {
    name_pt: 'Sistema de Arquivos (Oficial)',
    description_pt: 'Servidor MCP oficial para acesso direto ao sistema de arquivos local. Fornece operações de leitura, escrita, listagem e busca.'
  },
  'FileSystem (Golang)': {
    name_pt: 'Sistema de Arquivos (Golang)',
    description_pt: 'Implementação Golang para acesso ao sistema de arquivos local através do MCP. Oferece operações de arquivo de alta performance.'
  },
  'GraphQL MCP Server': {
    name_pt: 'Servidor MCP GraphQL',
    description_pt: 'Integração de API GraphQL através do MCP para consulta flexível de dados e operações eficientes.'
  },
  'NocoDB MCP Server': {
    name_pt: 'Servidor MCP NocoDB',
    description_pt: 'Acesso de leitura e escrita ao banco de dados NocoDB através do MCP. Fornece interface no-code para bancos de dados.'
  },
  'Couchbase MCP Server': {
    name_pt: 'Servidor MCP Couchbase',
    description_pt: 'Servidor MCP para interagir com dados armazenados em clusters Couchbase. Oferece operações de banco NoSQL.'
  },
  'TiDB MCP Server': {
    name_pt: 'Servidor MCP TiDB',
    description_pt: 'Implementação de servidor MCP para banco de dados serverless TiDB. Fornece escalabilidade automática e compatibilidade MySQL.'
  },
  'WordPress MCP Server': {
    name_pt: 'Servidor MCP WordPress',
    description_pt: 'Integração WordPress através do MCP para gerenciamento de conteúdo. Permite criar e gerenciar conteúdo WordPress com IA.'
  },
  'Twitter MCP Server': {
    name_pt: 'Servidor MCP Twitter',
    description_pt: 'Integração da API Twitter (X) através do MCP para interação em redes sociais. Permite ler e postar tweets com IA.'
  },
  'Microsoft Teams MCP Server': {
    name_pt: 'Servidor MCP Microsoft Teams',
    description_pt: 'Integração Microsoft Teams através do MCP para comunicação em equipe. Permite interagir com canais e chats do Teams.'
  },
  // Custom products with better Portuguese
  'gorila da xita': {
    name_pt: 'Gorila da Xita',
    description_pt: 'Servidor MCP personalizado para integração avançada com sistemas de IA e automação de tarefas.'
  },
  'Xita': {
    name_pt: 'Xita',
    description_pt: 'Agente de IA avançado projetado para automação inteligente e integração com diferentes sistemas tecnológicos.'
  },
  'agente gorila special ops': {
    name_pt: 'Agente Gorila Special Ops',
    description_pt: 'Agente de IA especializado em operações especiais e processamento avançado de tarefas complexas.'
  },
  'gorilaaa': {
    name_pt: 'Gorilaaa',
    description_pt: 'Servidor MCP personalizado com funcionalidades especiais para automação e integração de sistemas.'
  },
  'novao': {
    name_pt: 'Novao',
    description_pt: 'Servidor MCP inovador com recursos avançados para integração com Claude e outros sistemas de IA.'
  }
};

async function finishRemainingTranslations() {
  try {
    await client.connect();
    console.log('🌐 Finishing Portuguese translations for remaining products...\n');
    
    // Get all products that still need translations
    const remainingResult = await client.query(`
      SELECT id, name, name_en, description_en, description_pt
      FROM products 
      WHERE is_active = true 
        AND (description_pt = description_en OR description_pt IS NULL OR description_pt = '')
      ORDER BY id
    `);
    
    const products = remainingResult.rows;
    console.log(`📦 Found ${products.length} products that still need Portuguese translations`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      const productName = product.name_en || product.name;
      
      console.log(`🔧 Processing: "${productName}" (ID: ${product.id})`);
      
      if (finalTranslations[productName]) {
        // Use specific translation
        const translation = finalTranslations[productName];
        
        const updateQuery = `
          UPDATE products 
          SET 
            name_pt = $1,
            description_pt = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3;
        `;
        
        await client.query(updateQuery, [
          translation.name_pt,
          translation.description_pt,
          product.id
        ]);
        
        console.log(`   ✨ Updated with specific translation: "${translation.name_pt}"`);
        console.log(`   📄 Description: "${translation.description_pt.substring(0, 60)}..."`);
        updatedCount++;
      } else {
        // Create a basic Portuguese translation from English
        const englishDesc = product.description_en || product.description;
        if (englishDesc && englishDesc.length > 10) {
          // Basic translation rules for common terms
          let basicTranslation = englishDesc
            .replace(/\bserver\b/gi, 'servidor')
            .replace(/\bclient\b/gi, 'cliente')
            .replace(/\bdatabase\b/gi, 'banco de dados')
            .replace(/\bintegration\b/gi, 'integração')
            .replace(/\bthrough MCP\b/gi, 'através do MCP')
            .replace(/\bfor\b/gi, 'para')
            .replace(/\band\b/gi, 'e')
            .replace(/\bwith\b/gi, 'com')
            .replace(/\bfile\b/gi, 'arquivo')
            .replace(/\bfiles\b/gi, 'arquivos')
            .replace(/\bmanagement\b/gi, 'gerenciamento')
            .replace(/\baccess\b/gi, 'acesso')
            .replace(/\bsupport\b/gi, 'suporte')
            .replace(/\bAI\b/gi, 'IA')
            .replace(/\boperations\b/gi, 'operações');
          
          const updateQuery = `
            UPDATE products 
            SET 
              description_pt = $1,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $2;
          `;
          
          await client.query(updateQuery, [basicTranslation, product.id]);
          
          console.log(`   🔄 Updated with basic translation`);
          console.log(`   📄 Description: "${basicTranslation.substring(0, 60)}..."`);
          updatedCount++;
        } else {
          console.log(`   ⏭️  Skipped (no good description to translate)`);
        }
      }
      console.log('');
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} products!`);
    
    // Show final status
    const finalStatus = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN description_pt IS NOT NULL AND description_pt != description_en AND description_pt != '' THEN 1 END) as with_portuguese,
        COUNT(CASE WHEN description_pt = description_en OR description_pt IS NULL OR description_pt = '' THEN 1 END) as with_english
      FROM products 
      WHERE is_active = true
    `);
    
    const stats = finalStatus.rows[0];
    console.log(`\n📊 Final Status:`);
    console.log(`   • Total products: ${stats.total}`);
    console.log(`   • With Portuguese translations: ${stats.with_portuguese}`);
    console.log(`   • With English descriptions: ${stats.with_english}`);
    console.log(`   • Portuguese coverage: ${Math.round((stats.with_portuguese / stats.total) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

finishRemainingTranslations();