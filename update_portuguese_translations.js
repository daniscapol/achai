import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ProductMultilingual from './api/_lib/ProductMultilingual.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Better Portuguese translations for common MCP products
const betterTranslations = {
  // Common MCP Servers
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
    description_pt: 'Serviço de acesso a armazenamento remoto que suporta SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint e mais através de uma interface MCP unificada.'
  },
  'Sourcegraph Cody': {
    name_pt: 'Sourcegraph Cody',
    description_pt: 'Assistente de codificação IA com integração MCP para análise, geração e documentação avançada de código.'
  },
  'Claude Code': {
    name_pt: 'Claude Code',
    description_pt: 'Ferramenta CLI oficial para escrever e refatorar código com Claude. Integra-se perfeitamente ao seu fluxo de trabalho de desenvolvimento.'
  },
  'Claude CLI': {
    name_pt: 'Claude CLI',
    description_pt: 'Interface de linha de comando para Anthropic Claude com suporte MCP. Acesse Claude e todos os seus servidores MCP através de uma ferramenta simples de linha de comando.'
  },
  'GitHub': {
    name_pt: 'GitHub',
    description_pt: 'Integração da API GitHub para gerenciamento de repositórios, PRs, issues e mais. Permite à IA interagir e gerenciar repositórios e fluxos de trabalho do GitHub.'
  },
  'PostgreSQL MCP Server': {
    name_pt: 'Servidor MCP PostgreSQL',
    description_pt: 'Servidor MCP para integração com banco de dados PostgreSQL, permitindo consultas e operações através do protocolo MCP.'
  },
  'MCP CLI Client': {
    name_pt: 'Cliente MCP CLI',
    description_pt: 'Cliente de linha de comando para interagir com servidores MCP, fornecendo acesso direto às funcionalidades MCP via terminal.'
  },
  'Claude Desktop': {
    name_pt: 'Claude Desktop',
    description_pt: 'Aplicativo desktop oficial do Claude com suporte completo a MCP para integração com servidores locais e remotos.'
  },
  'VSCode MCP Extension': {
    name_pt: 'Extensão MCP VSCode',
    description_pt: 'Extensão do Visual Studio Code que adiciona suporte nativo ao protocolo MCP para desenvolvimento integrado.'
  }
};

async function updateProductTranslations() {
  console.log('🌐 Updating Portuguese translations for products...');
  
  try {
    // Get all products
    const result = await ProductMultilingual.getAll(1, 1000, 'en');
    const products = result.products;
    
    console.log(`📦 Found ${products.length} products to potentially update`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      const name = product.name_en || product.name;
      
      // Check if we have a better translation for this product
      if (betterTranslations[name]) {
        const translation = betterTranslations[name];
        
        try {
          await ProductMultilingual.updateMultilingual(product.id, {
            name_pt: translation.name_pt,
            description_pt: translation.description_pt
          });
          
          console.log(`✅ Updated "${name}" -> "${translation.name_pt}"`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Failed to update "${name}":`, error.message);
        }
      } else {
        // Check if current Portuguese translation is a placeholder
        const currentDescPt = product.description_pt;
        if (currentDescPt && (
          currentDescPt.includes('Este servidor MCP foi desenvolvido para integração com Claude AI') ||
          currentDescPt.includes('Este cliente MCP foi desenvolvido para integração com Claude AI') ||
          currentDescPt.includes('Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude')
        )) {
          // Try to create a better translation from the English description
          const englishDesc = product.description_en || product.description;
          if (englishDesc && englishDesc.length > 50) {
            // Use the original English description as-is for now, 
            // rather than the placeholder Portuguese
            try {
              await ProductMultilingual.updateMultilingual(product.id, {
                description_pt: englishDesc
              });
              
              console.log(`🔄 Replaced placeholder translation for "${name}"`);
              updatedCount++;
            } catch (error) {
              console.error(`❌ Failed to update placeholder for "${name}":`, error.message);
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} product translations`);
    
  } catch (error) {
    console.error('❌ Error updating translations:', error.message);
    console.log('\n💡 Note: Make sure your database is running and accessible');
    console.log('💡 You can start your database and then run this script to populate proper Portuguese translations');
  }
}

// Export for use in other scripts
export { betterTranslations };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateProductTranslations();
}

export default updateProductTranslations;