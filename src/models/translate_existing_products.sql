-- SQL script to translate existing products to Portuguese
-- This script provides sample translations for common MCP-related terms

-- Create a temporary table with translation mappings
CREATE TEMP TABLE translation_mappings (
  en_term TEXT,
  pt_term TEXT
);

-- Insert common translation mappings
INSERT INTO translation_mappings (en_term, pt_term) VALUES
  ('MCP Server', 'Servidor MCP'),
  ('AI Agent', 'Agente de IA'),
  ('Database', 'Banco de Dados'),
  ('File System', 'Sistema de Arquivos'),
  ('Web Scraping', 'Raspagem Web'),
  ('API Integration', 'Integração de API'),
  ('Authentication', 'Autenticação'),
  ('Data Processing', 'Processamento de Dados'),
  ('Cloud Storage', 'Armazenamento em Nuvem'),
  ('Machine Learning', 'Aprendizado de Máquina'),
  ('Natural Language', 'Linguagem Natural'),
  ('Task Management', 'Gerenciamento de Tarefas'),
  ('Email Integration', 'Integração de Email'),
  ('Calendar', 'Calendário'),
  ('Productivity', 'Produtividade'),
  ('Development Tools', 'Ferramentas de Desenvolvimento'),
  ('Code Generation', 'Geração de Código'),
  ('Testing', 'Testes'),
  ('Deployment', 'Implantação'),
  ('Monitoring', 'Monitoramento'),
  ('Security', 'Segurança'),
  ('Encryption', 'Criptografia'),
  ('Analytics', 'Análise'),
  ('Reporting', 'Relatórios'),
  ('Content Management', 'Gerenciamento de Conteúdo'),
  ('Social Media', 'Redes Sociais'),
  ('E-commerce', 'E-commerce'),
  ('Payment Processing', 'Processamento de Pagamentos'),
  ('Customer Support', 'Suporte ao Cliente'),
  ('Communication', 'Comunicação'),
  ('Search', 'Busca'),
  ('Indexing', 'Indexação'),
  ('Data Visualization', 'Visualização de Dados'),
  ('Dashboard', 'Painel'),
  ('Workflow', 'Fluxo de Trabalho'),
  ('Automation', 'Automação'),
  ('Integration', 'Integração'),
  ('Synchronization', 'Sincronização'),
  ('Backup', 'Backup'),
  ('Version Control', 'Controle de Versão'),
  ('Documentation', 'Documentação'),
  ('Template', 'Modelo'),
  ('Configuration', 'Configuração'),
  ('Management', 'Gerenciamento'),
  ('Server', 'Servidor'),
  ('Client', 'Cliente'),
  ('Library', 'Biblioteca'),
  ('Framework', 'Framework'),
  ('Tool', 'Ferramenta'),
  ('Utility', 'Utilitário'),
  ('Service', 'Serviço'),
  ('Platform', 'Plataforma'),
  ('Application', 'Aplicação'),
  ('System', 'Sistema'),
  ('Network', 'Rede'),
  ('Protocol', 'Protocolo'),
  ('Interface', 'Interface'),
  ('Module', 'Módulo'),
  ('Component', 'Componente'),
  ('Plugin', 'Plugin'),
  ('Extension', 'Extensão'),
  ('Add-on', 'Complemento'),
  ('Package', 'Pacote'),
  ('Bundle', 'Pacote'),
  ('Collection', 'Coleção'),
  ('Suite', 'Suíte'),
  ('Toolkit', 'Kit de Ferramentas');

-- Helper function to apply multiple replacements to text
CREATE OR REPLACE FUNCTION translate_text(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  result_text TEXT;
  mapping RECORD;
BEGIN
  result_text := input_text;
  
  FOR mapping IN SELECT * FROM translation_mappings LOOP
    result_text := REPLACE(result_text, mapping.en_term, mapping.pt_term);
  END LOOP;
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Update products with Portuguese translations
-- For names, we'll apply translations where applicable
UPDATE products 
SET name_pt = translate_text(name_en)
WHERE name_pt IS NULL OR name_pt = name_en;

-- For descriptions, we'll apply translations and add a Portuguese intro
UPDATE products 
SET description_pt = 
  CASE 
    WHEN description_en IS NOT NULL THEN 
      'Este ' || 
      CASE 
        WHEN product_type = 'mcp_server' THEN 'servidor MCP'
        WHEN product_type = 'mcp_client' THEN 'cliente MCP'
        WHEN product_type = 'ai_agent' THEN 'agente de IA'
        ELSE 'produto'
      END ||
      ' oferece funcionalidades avançadas para integração com sistemas Claude. ' ||
      translate_text(description_en)
    ELSE description_pt
  END
WHERE description_pt IS NULL OR description_pt = description_en;

-- Update specific product categories to Portuguese
UPDATE products 
SET name_pt = 
  CASE 
    WHEN name_en LIKE '%Database%' THEN REPLACE(name_pt, 'Database', 'Banco de Dados')
    WHEN name_en LIKE '%File%' THEN REPLACE(name_pt, 'File', 'Arquivo')
    WHEN name_en LIKE '%Web%' THEN REPLACE(name_pt, 'Web', 'Web')
    WHEN name_en LIKE '%API%' THEN name_pt -- Keep API as is
    WHEN name_en LIKE '%GitHub%' THEN name_pt -- Keep GitHub as is
    WHEN name_en LIKE '%Google%' THEN name_pt -- Keep Google as is
    WHEN name_en LIKE '%AWS%' THEN name_pt -- Keep AWS as is
    ELSE name_pt
  END;

-- Add more specific translations for common MCP server types
UPDATE products 
SET 
  name_pt = 
    CASE 
      WHEN LOWER(name_en) LIKE '%filesystem%' THEN REPLACE(name_pt, 'Filesystem', 'Sistema de Arquivos')
      WHEN LOWER(name_en) LIKE '%sqlite%' THEN name_pt -- Keep SQLite as is
      WHEN LOWER(name_en) LIKE '%postgres%' THEN name_pt -- Keep PostgreSQL as is
      WHEN LOWER(name_en) LIKE '%mysql%' THEN name_pt -- Keep MySQL as is
      WHEN LOWER(name_en) LIKE '%redis%' THEN name_pt -- Keep Redis as is
      WHEN LOWER(name_en) LIKE '%mongodb%' THEN name_pt -- Keep MongoDB as is
      WHEN LOWER(name_en) LIKE '%elasticsearch%' THEN name_pt -- Keep Elasticsearch as is
      WHEN LOWER(name_en) LIKE '%docker%' THEN name_pt -- Keep Docker as is
      WHEN LOWER(name_en) LIKE '%kubernetes%' THEN name_pt -- Keep Kubernetes as is
      WHEN LOWER(name_en) LIKE '%slack%' THEN name_pt -- Keep Slack as is
      WHEN LOWER(name_en) LIKE '%discord%' THEN name_pt -- Keep Discord as is
      WHEN LOWER(name_en) LIKE '%telegram%' THEN name_pt -- Keep Telegram as is
      WHEN LOWER(name_en) LIKE '%whatsapp%' THEN name_pt -- Keep WhatsApp as is
      ELSE name_pt
    END,
  description_pt = 
    CASE 
      WHEN description_pt LIKE '%Este servidor MCP%' THEN description_pt
      ELSE 
        'Este ' || 
        CASE 
          WHEN product_type = 'mcp_server' THEN 'servidor MCP'
          WHEN product_type = 'mcp_client' THEN 'cliente MCP'
          WHEN product_type = 'ai_agent' THEN 'agente de IA'
          ELSE 'produto'
        END ||
        ' foi desenvolvido para integração com Claude AI. ' ||
        COALESCE(description_pt, translate_text(COALESCE(description_en, description, 'Sem descrição disponível.')))
    END;

-- Clean up the helper function
DROP FUNCTION translate_text(TEXT);
DROP TABLE translation_mappings;

-- Update language_code for all products to reflect multilingual support
UPDATE products 
SET language_code = 'multi'
WHERE name_pt IS NOT NULL AND name_pt != name_en;