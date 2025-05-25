-- SQL script to fix placeholder Portuguese translations
-- This removes generic placeholder text and replaces it with better content

-- First, let's see how many products have placeholder text
SELECT 
  COUNT(*) as total_with_placeholders,
  COUNT(CASE WHEN description_pt LIKE '%Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude%' THEN 1 END) as server_placeholders,
  COUNT(CASE WHEN description_pt LIKE '%Este cliente MCP foi desenvolvido para integração com Claude AI%' THEN 1 END) as client_placeholders,
  COUNT(CASE WHEN description_pt LIKE '%Este agente de IA foi desenvolvido para integração com Claude AI%' THEN 1 END) as agent_placeholders
FROM products 
WHERE 
  description_pt LIKE '%Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude%' OR
  description_pt LIKE '%Este cliente MCP foi desenvolvido para integração com Claude AI%' OR
  description_pt LIKE '%Este agente de IA foi desenvolvido para integração com Claude AI%';

-- Update products to use English descriptions instead of placeholder Portuguese
-- This is better than generic placeholder text
UPDATE products 
SET description_pt = COALESCE(description_en, description)
WHERE 
  description_pt LIKE '%Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude%' OR
  description_pt LIKE '%Este cliente MCP foi desenvolvido para integração com Claude AI%' OR
  description_pt LIKE '%Este agente de IA foi desenvolvido para integração com Claude AI%';

-- Now add some specific good Portuguese translations for common products
UPDATE products 
SET 
  name_pt = 'Visual Studio Code',
  description_pt = 'Editor de código popular com integração MCP para assistência de desenvolvimento com IA.'
WHERE name_en = 'Visual Studio Code' OR name LIKE '%Visual Studio Code%';

UPDATE products 
SET 
  name_pt = 'Cursor',
  description_pt = 'Editor de código alimentado por IA com integração MCP para autocompletar e edição avançada.'
WHERE name_en = 'Cursor' OR name = 'Cursor';

UPDATE products 
SET 
  name_pt = 'ArquivoStash',
  description_pt = 'Serviço de acesso a armazenamento remoto que suporta SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint e mais através de uma interface MCP unificada.'
WHERE name_en = 'FileStash' OR name = 'FileStash';

UPDATE products 
SET 
  name_pt = 'Sourcegraph Cody',
  description_pt = 'Assistente de codificação IA com integração MCP para análise, geração e documentação avançada de código.'
WHERE name_en = 'Sourcegraph Cody' OR name LIKE '%Sourcegraph Cody%';

UPDATE products 
SET 
  name_pt = 'Claude Code',
  description_pt = 'Ferramenta CLI oficial para escrever e refatorar código com Claude. Integra-se perfeitamente ao seu fluxo de trabalho de desenvolvimento.'
WHERE name_en = 'Claude Code' OR name = 'Claude Code';

UPDATE products 
SET 
  name_pt = 'Claude CLI',
  description_pt = 'Interface de linha de comando para Anthropic Claude com suporte MCP. Acesse Claude e todos os seus servidores MCP através de uma ferramenta simples de linha de comando.'
WHERE name_en = 'Claude CLI' OR name = 'Claude CLI';

UPDATE products 
SET 
  name_pt = 'GitHub',
  description_pt = 'Integração da API GitHub para gerenciamento de repositórios, PRs, issues e mais. Permite à IA interagir e gerenciar repositórios e fluxos de trabalho do GitHub.'
WHERE name_en = 'GitHub' OR name = 'GitHub';

UPDATE products 
SET 
  name_pt = 'Claude Desktop',
  description_pt = 'Aplicativo desktop oficial do Claude com suporte completo a MCP para integração com servidores locais e remotos.'
WHERE name_en = 'Claude Desktop' OR name LIKE '%Claude Desktop%';

UPDATE products 
SET 
  name_pt = 'PostgreSQL',
  description_pt = 'Servidor MCP para integração com banco de dados PostgreSQL, permitindo consultas e operações através do protocolo MCP.'
WHERE name_en LIKE '%PostgreSQL%' OR name LIKE '%PostgreSQL%';

-- Add some translations for database-related terms
UPDATE products 
SET description_pt = REPLACE(description_pt, 'database', 'banco de dados')
WHERE description_pt LIKE '%database%' AND description_pt NOT LIKE '%Este servidor MCP%';

UPDATE products 
SET description_pt = REPLACE(description_pt, 'Database', 'Banco de Dados')
WHERE description_pt LIKE '%Database%' AND description_pt NOT LIKE '%Este servidor MCP%';

-- Add some translations for common technical terms
UPDATE products 
SET description_pt = REPLACE(description_pt, ' server', ' servidor')
WHERE description_pt LIKE '% server%' AND description_pt NOT LIKE '%Este servidor MCP%';

UPDATE products 
SET description_pt = REPLACE(description_pt, 'Server', 'Servidor')
WHERE description_pt LIKE '%Server%' AND description_pt NOT LIKE '%Este servidor MCP%';

UPDATE products 
SET description_pt = REPLACE(description_pt, ' client', ' cliente')
WHERE description_pt LIKE '% client%' AND description_pt NOT LIKE '%Este cliente MCP%';

UPDATE products 
SET description_pt = REPLACE(description_pt, 'Client', 'Cliente')
WHERE description_pt LIKE '%Client%' AND description_pt NOT LIKE '%Este cliente MCP%';

-- Update language_code to reflect that we now have multilingual content
UPDATE products 
SET language_code = 'multi'
WHERE name_pt IS NOT NULL AND name_pt != '' AND name_pt != name_en;

-- Final verification query
SELECT 
  id,
  name,
  name_pt,
  LEFT(description_en, 50) as desc_en_preview,
  LEFT(description_pt, 50) as desc_pt_preview,
  language_code
FROM products 
WHERE description_pt NOT LIKE '%Este servidor MCP oferece funcionalidades avançadas%'
  AND description_pt NOT LIKE '%Este cliente MCP foi desenvolvido%'
  AND description_pt NOT LIKE '%Este agente de IA foi desenvolvido%'
LIMIT 10;