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

// Additional Portuguese translations for more products
const moreTranslations = {
  'Slack': {
    name_pt: 'Slack',
    description_pt: 'Integração do workspace Slack para gerenciamento de canais e mensagens através do protocolo MCP.'
  },
  'ChatGPT': {
    name_pt: 'ChatGPT',
    description_pt: 'Interface de IA conversacional da OpenAI com integração MCP. Permite conversas inteligentes e geração de conteúdo.'
  },
  'Perplexity AI': {
    name_pt: 'Perplexity AI',
    description_pt: 'Motor de busca com IA e integração MCP para consultas interativas e pesquisa inteligente de informações.'
  },
  'Nova': {
    name_pt: 'Nova',
    description_pt: 'Editor de código nativo elegante para macOS com integração MCP. Combina simplicidade com funcionalidades avançadas.'
  },
  'JetBrains IDE Suite': {
    name_pt: 'Suíte JetBrains IDE',
    description_pt: 'Ferramentas profissionais de desenvolvimento com integração MCP. Inclui IntelliJ IDEA, PyCharm, WebStorm e mais.'
  },
  'Everything Search': {
    name_pt: 'Everything Busca',
    description_pt: 'Busca ultrarrápida de arquivos no Windows alimentada pelo SDK Everything. Localiza arquivos instantaneamente.'
  },
  'PostgreSQL': {
    name_pt: 'PostgreSQL',
    description_pt: 'Integração de banco de dados PostgreSQL com inspeção de esquema e capacidades de consulta através do MCP.'
  },
  'OpenAPI MCP Server': {
    name_pt: 'Servidor MCP OpenAPI',
    description_pt: 'Conecta-se a servidores de API HTTP/REST usando especificações OpenAPI através do protocolo MCP.'
  },
  'Keycloak MCP Server': {
    name_pt: 'Servidor MCP Keycloak',
    description_pt: 'Servidor MCP para gerenciar usuários, grupos e realms do Keycloak. Oferece autenticação e autorização centralizadas.'
  },
  'Zapier MCP Server': {
    name_pt: 'Servidor MCP Zapier',
    description_pt: 'Conecta agentes de IA a mais de 8.000 aplicativos instantaneamente através da integração Zapier.'
  },
  'LLDB MCP Server': {
    name_pt: 'Servidor MCP LLDB',
    description_pt: 'Servidor MCP para LLDB que permite análise binária com IA e capacidades de depuração avançadas.'
  },
  'YouTube MCP Server': {
    name_pt: 'Servidor MCP YouTube',
    description_pt: 'Integração da API YouTube para download de legendas e análise de vídeos através do protocolo MCP.'
  },
  'Bluesky MCP Server': {
    name_pt: 'Servidor MCP Bluesky',
    description_pt: 'Integração da API Bluesky para consulta e busca de feeds e postagens na rede social descentralizada.'
  },
  'SonarQube MCP Server': {
    name_pt: 'Servidor MCP SonarQube',
    description_pt: 'Integra-se com SonarQube para métricas de qualidade de código, permitindo análise automática de código.'
  },
  'Figma MCP Server': {
    name_pt: 'Servidor MCP Figma',
    description_pt: 'Dá ao seu agente de codificação acesso direto aos dados de arquivos Figma, facilitando o desenvolvimento orientado por design.'
  },
  'Excel MCP Server': {
    name_pt: 'Servidor MCP Excel',
    description_pt: 'Manipulação de planilhas Excel incluindo leitura/escrita de dados, formatação e análise através do MCP.'
  },
  'Spotify MCP Server': {
    name_pt: 'Servidor MCP Spotify',
    description_pt: 'Integração da API Spotify para controle de reprodução e busca de faixas/álbuns através do protocolo MCP.'
  }
};

async function addMoreTranslations() {
  try {
    await client.connect();
    console.log('🌐 Adding more Portuguese translations...\n');
    
    // Get products that are currently using English descriptions
    const englishProductsResult = await client.query(`
      SELECT id, name, name_en, description_en, description_pt
      FROM products 
      WHERE is_active = true 
        AND (description_pt = description_en OR description_pt IS NULL OR description_pt = '')
        AND description_pt NOT LIKE '%Este servidor MCP oferece%'
        AND description_pt NOT LIKE '%Este cliente MCP foi%'
        AND description_pt NOT LIKE '%Este agente de IA foi%'
      ORDER BY id
      LIMIT 20
    `);
    
    const products = englishProductsResult.rows;
    console.log(`📦 Found ${products.length} products using English descriptions`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      const productName = product.name_en || product.name;
      
      if (moreTranslations[productName]) {
        const translation = moreTranslations[productName];
        
        console.log(`🔧 Updating: "${productName}" (ID: ${product.id})`);
        
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
        
        console.log(`   ✅ Updated: "${translation.name_pt}"`);
        console.log(`   📄 Description: "${translation.description_pt.substring(0, 60)}..."`);
        console.log('');
        
        updatedCount++;
      }
    }
    
    console.log(`🎉 Successfully added Portuguese translations to ${updatedCount} more products!`);
    
    // Show final status
    const finalResult = await client.query(`
      SELECT COUNT(*) as count FROM products 
      WHERE is_active = true 
        AND description_pt IS NOT NULL 
        AND description_pt != description_en
        AND description_pt NOT LIKE '%Este servidor MCP oferece%'
        AND description_pt NOT LIKE '%Este cliente MCP foi%'
        AND description_pt NOT LIKE '%Este agente de IA foi%'
        AND description_pt != ''
    `);
    
    console.log(`\n📊 Total products with proper Portuguese translations: ${finalResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addMoreTranslations();