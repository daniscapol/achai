import pg from 'pg';
const { Client } = pg;

// Database connection configuration
const dbConfig = {
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: {
    rejectUnauthorized: false
  }
};

// Better Portuguese translations for specific products
const specificTranslations = {
  'Visual Studio Code': {
    name_pt: 'Visual Studio Code',
    description_pt: 'Editor de código popular com integração MCP para assistência de desenvolvimento com IA.'
  },
  'Cursor': {
    name_pt: 'Cursor',
    description_pt: 'Editor de código alimentado por IA com integração MCP para autocompletar e edição avançada.'
  },
  'FileStash': {
    name_pt: 'ArquivoStash',
    description_pt: 'Serviço de acesso a armazenamento remoto que suporta SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint e mais.'
  },
  'Sourcegraph Cody': {
    name_pt: 'Sourcegraph Cody',
    description_pt: 'Assistente de codificação IA com integração MCP para análise, geração e documentação avançada de código.'
  },
  'Claude Code': {
    name_pt: 'Claude Code',
    description_pt: 'Ferramenta CLI oficial para escrever e refatorar código com Claude. Integra-se perfeitamente ao seu fluxo de trabalho.'
  },
  'Claude CLI': {
    name_pt: 'Claude CLI',
    description_pt: 'Interface de linha de comando para Anthropic Claude com suporte MCP. Acesse Claude através do terminal.'
  },
  'GitHub': {
    name_pt: 'GitHub',
    description_pt: 'Integração da API GitHub para gerenciamento de repositórios, PRs, issues e mais.'
  },
  'Claude Desktop': {
    name_pt: 'Claude Desktop',
    description_pt: 'Aplicativo desktop oficial do Claude com suporte completo a MCP para integração local e remota.'
  },
  'PostgreSQL MCP Server': {
    name_pt: 'Servidor MCP PostgreSQL',
    description_pt: 'Servidor MCP para integração com banco de dados PostgreSQL, permitindo consultas através do protocolo MCP.'
  },
  'SQLite': {
    name_pt: 'SQLite',
    description_pt: 'Operações de banco de dados SQLite com análise integrada através do protocolo MCP.'
  },
  'MongoDB MCP Server': {
    name_pt: 'Servidor MCP MongoDB',
    description_pt: 'Integração MongoDB para operações de banco de dados de documentos através do protocolo MCP.'
  },
  'Redis MCP Server': {
    name_pt: 'Servidor MCP Redis',
    description_pt: 'Interface de linguagem natural para gerenciar eficientemente dados Redis através do protocolo MCP.'
  },
  'Docker MCP Server': {
    name_pt: 'Servidor MCP Docker',
    description_pt: 'Integração Docker através do MCP para gerenciamento de contêineres e operações de desenvolvimento.'
  },
  'AWS MCP Server': {
    name_pt: 'Servidor MCP AWS',
    description_pt: 'Integração AWS através do MCP para gerenciamento de recursos em nuvem e automação.'
  },
  'Google Drive': {
    name_pt: 'Google Drive',
    description_pt: 'Integração Google Drive para acesso, busca e gerenciamento de arquivos através do protocolo MCP.'
  },
  'Slack': {
    name_pt: 'Slack',
    description_pt: 'Integração do workspace Slack para gerenciamento de canais e mensagens através do protocolo MCP.'
  },
  'Kubernetes MCP Server': {
    name_pt: 'Servidor MCP Kubernetes',
    description_pt: 'Servidor MCP poderoso para Kubernetes com suporte para pods, deployments e recursos de cluster.'
  },
  'Azure MCP Server': {
    name_pt: 'Servidor MCP Azure',
    description_pt: 'Integração Microsoft Azure através do MCP para gerenciamento de recursos em nuvem.'
  },
  'Google Cloud MCP Server': {
    name_pt: 'Servidor MCP Google Cloud',
    description_pt: 'Integração Google Cloud Platform através do MCP para automação e gerenciamento de recursos.'
  },
  'Elasticsearch MCP Server': {
    name_pt: 'Servidor MCP Elasticsearch',
    description_pt: 'Servidor MCP para Elasticsearch com busca de texto completo e capacidades de análise.'
  },
  'Terraform MCP Server': {
    name_pt: 'Servidor MCP Terraform',
    description_pt: 'Integração Terraform através do MCP para automação de infraestrutura como código.'
  },
  'Jenkins MCP Server': {
    name_pt: 'Servidor MCP Jenkins',
    description_pt: 'Integração Jenkins através do MCP para pipelines de CI/CD e automação de builds.'
  },
  'GitLab MCP Server': {
    name_pt: 'Servidor MCP GitLab',
    description_pt: 'Integração GitLab através do MCP para repositórios, CI/CD e gerenciamento de DevOps.'
  },
  'Discord MCP Server': {
    name_pt: 'Servidor MCP Discord',
    description_pt: 'Integração Discord através do MCP para automação de bots e gerenciamento de servidores.'
  },
  'Notion MCP Server': {
    name_pt: 'Servidor MCP Notion',
    description_pt: 'Integração Notion através do MCP para gerenciamento de conhecimento e colaboração em equipe.'
  },
  'Jira MCP Server': {
    name_pt: 'Servidor MCP Jira',
    description_pt: 'Integração Jira através do MCP para rastreamento de issues e gerenciamento de projetos ágeis.'
  }
};

async function connectAndFixTranslations() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to AWS RDS PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // First, let's see what we have
    console.log('\n📊 Checking current translation status...');
    const statusQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN description_pt LIKE '%Este servidor MCP oferece%' OR description_pt LIKE '%Este cliente MCP foi%' OR description_pt LIKE '%Este agente de IA foi%' THEN 1 END) as placeholder_count
      FROM products 
      WHERE is_active = true;
    `;
    
    const statusResult = await client.query(statusQuery);
    const { total_products, placeholder_count } = statusResult.rows[0];
    
    console.log(`   • Total active products: ${total_products}`);
    console.log(`   • Products with placeholder Portuguese: ${placeholder_count}`);
    
    // Get products that need fixing
    console.log('\n🔍 Getting products that need translation fixes...');
    const productsQuery = `
      SELECT id, name, name_en, name_pt, description_en, description_pt, product_type
      FROM products 
      WHERE is_active = true 
        AND (description_pt LIKE '%Este servidor MCP oferece%' 
             OR description_pt LIKE '%Este cliente MCP foi%' 
             OR description_pt LIKE '%Este agente de IA foi%')
      ORDER BY id
      LIMIT 10;
    `;
    
    const productsResult = await client.query(productsQuery);
    const products = productsResult.rows;
    
    console.log(`Found ${products.length} products to fix. Starting one by one...\n`);
    
    let fixedCount = 0;
    
    for (const product of products) {
      const productName = product.name_en || product.name;
      console.log(`🔧 Fixing: "${productName}" (ID: ${product.id})`);
      
      let newNamePt = product.name_pt;
      let newDescriptionPt = product.description_pt;
      
      // Check if we have a specific translation
      if (specificTranslations[productName]) {
        const translation = specificTranslations[productName];
        newNamePt = translation.name_pt;
        newDescriptionPt = translation.description_pt;
        console.log(`   ✨ Using specific Portuguese translation`);
      } else {
        // Use English description instead of placeholder
        newDescriptionPt = product.description_en || product.description || 'Sem descrição disponível.';
        console.log(`   📝 Using English description instead of placeholder`);
      }
      
      // Update the product
      const updateQuery = `
        UPDATE products 
        SET 
          name_pt = $1,
          description_pt = $2,
          language_code = 'multi',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3;
      `;
      
      await client.query(updateQuery, [newNamePt, newDescriptionPt, product.id]);
      
      console.log(`   ✅ Updated: "${newNamePt}"`);
      console.log(`   📄 Description: "${newDescriptionPt.substring(0, 60)}..."`);
      console.log('');
      
      fixedCount++;
    }
    
    console.log(`🎉 Successfully fixed ${fixedCount} products!`);
    
    // Show verification
    console.log('\n🔍 Verification - checking updated products:');
    const verifyQuery = `
      SELECT id, name_pt, LEFT(description_pt, 50) as description_preview
      FROM products 
      WHERE id = ANY($1)
      ORDER BY id;
    `;
    
    const productIds = products.map(p => p.id);
    const verifyResult = await client.query(verifyQuery, [productIds]);
    
    verifyResult.rows.forEach(row => {
      console.log(`   • ${row.name_pt}: "${row.description_preview}..."`);
    });
    
    // Check remaining placeholder count
    const remainingResult = await client.query(statusQuery);
    const remainingPlaceholders = remainingResult.rows[0].placeholder_count;
    console.log(`\n📊 Remaining products with placeholders: ${remainingPlaceholders}`);
    
    if (remainingPlaceholders > 0) {
      console.log('\n💡 To fix more products, run this script again!');
    } else {
      console.log('\n🎉 All placeholder translations have been fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the fix
connectAndFixTranslations();