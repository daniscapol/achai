-- Insert AI Agents from ai_agents_data.json into PostgreSQL database
-- Database: achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com:5432
-- User: achai, Database: achai

-- Start transaction
BEGIN;

-- Insert AI Agents with both English and Portuguese translations
INSERT INTO products (
    name, 
    description, 
    product_type, 
    category, 
    official, 
    stars_numeric, 
    tags, 
    is_active, 
    is_featured,
    name_en,
    name_pt,
    description_en,
    description_pt,
    language_code,
    created_at,
    updated_at,
    slug
) VALUES 
(
    'GPT Researcher',
    'An autonomous agent for conducting thorough web research on any topic',
    'ai_agent',
    'Research & Knowledge',
    false,
    1950,
    '["research", "web", "autonomous"]'::text[],
    true,
    true,
    'GPT Researcher',
    'GPT Pesquisador',
    'An autonomous agent for conducting thorough web research on any topic',
    'Um agente autônomo para conduzir pesquisas web completas sobre qualquer tópico',
    'en',
    NOW(),
    NOW(),
    'gpt-researcher'
),
(
    'Auto-GPT',
    'An experimental open-source AI agent that autonomously achieves goals',
    'ai_agent',
    'Autonomous Agents',
    false,
    2850,
    '["autonomous", "agent", "goal-oriented"]'::text[],
    true,
    true,
    'Auto-GPT',
    'Auto-GPT',
    'An experimental open-source AI agent that autonomously achieves goals',
    'Um agente de IA experimental de código aberto que alcança objetivos de forma autônoma',
    'en',
    NOW(),
    NOW(),
    'auto-gpt'
),
(
    'BabyAGI',
    'A simple AI agent using task-driven autonomous execution',
    'ai_agent',
    'Task Management',
    false,
    1750,
    '["task", "autonomous", "simple"]'::text[],
    true,
    true,
    'BabyAGI',
    'BabyAGI',
    'A simple AI agent using task-driven autonomous execution',
    'Um agente de IA simples usando execução autônoma orientada por tarefas',
    'en',
    NOW(),
    NOW(),
    'baby-agi'
),
(
    'CrewAI',
    'Framework for orchestrating AI agents that collaborate to achieve complex goals',
    'ai_agent',
    'Multi-agent Systems',
    false,
    2100,
    '["collaboration", "framework", "multi-agent"]'::text[],
    true,
    true,
    'CrewAI',
    'CrewAI',
    'Framework for orchestrating AI agents that collaborate to achieve complex goals',
    'Framework para orquestrar agentes de IA autônomos com papéis definidos',
    'en',
    NOW(),
    NOW(),
    'crew-ai'
),
(
    'AgentGPT',
    'Autonomous AI agent that can browse the web and execute tasks',
    'ai_agent',
    'Autonomous Agents',
    false,
    1800,
    '["autonomous", "web", "tasks"]'::text[],
    true,
    false,
    'AgentGPT',
    'AgentGPT',
    'Autonomous AI agent that can browse the web and execute tasks',
    'Agente de IA autônomo que pode navegar na web e executar tarefas',
    'en',
    NOW(),
    NOW(),
    'agent-gpt'
),
(
    'LangGraph',
    'Build multi-agent teams with graph-based workflows',
    'ai_agent',
    'AI Development',
    false,
    1600,
    '["graph", "workflow", "multi-agent"]'::text[],
    true,
    false,
    'LangGraph',
    'LangGraph',
    'Build multi-agent teams with graph-based workflows',
    'Construa equipes multi-agente com fluxos de trabalho baseados em grafos',
    'en',
    NOW(),
    NOW(),
    'lang-graph'
),
(
    'AutoGen',
    'Multi-agent conversation framework with customizable agents',
    'ai_agent',
    'Multi-agent Systems',
    false,
    1900,
    '["conversation", "framework", "customizable"]'::text[],
    true,
    false,
    'AutoGen',
    'AutoGen',
    'Multi-agent conversation framework with customizable agents',
    'Framework de conversação multi-agente com agentes personalizáveis',
    'en',
    NOW(),
    NOW(),
    'auto-gen'
),
(
    'SmolAGI',
    'Minimal implementation of a general AI agent',
    'ai_agent',
    'AI Development',
    false,
    1200,
    '["minimal", "implementation", "general"]'::text[],
    true,
    false,
    'SmolAGI',
    'SmolAGI',
    'Minimal implementation of a general AI agent',
    'Implementação mínima de um agente de IA geral',
    'en',
    NOW(),
    NOW(),
    'smol-agi'
);

-- Verify the insertions
SELECT COUNT(*) as "AI Agents Inserted" FROM products WHERE product_type = 'ai_agent';

-- Show the inserted AI agents
SELECT id, name, product_type, category, stars_numeric, name_pt, description_pt 
FROM products 
WHERE product_type = 'ai_agent' 
ORDER BY stars_numeric DESC;

-- Commit the transaction
COMMIT;

-- Note: You can run this script using psql:
-- psql -h achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com -p 5432 -U achai -d achai -f insert_ai_agents.sql