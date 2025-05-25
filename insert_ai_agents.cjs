#!/usr/bin/env node

const { Pool } = require('pg');
const aiAgentsData = require('./src/ai_agents_data.json');

// Database configuration
const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: {
    rejectUnauthorized: false
  }
});

// Portuguese translations for AI agents
const translations = {
  'GPT Researcher': 'GPT Pesquisador',
  'Auto-GPT': 'Auto-GPT',
  'BabyAGI': 'BabyAGI',
  'CrewAI': 'CrewAI',
  'AgentGPT': 'AgentGPT',
  'LangGraph': 'LangGraph',
  'AutoGen': 'AutoGen',
  'SmolAGI': 'SmolAGI',
  'An autonomous agent for conducting thorough web research on any topic': 'Um agente autônomo para conduzir pesquisas web completas sobre qualquer tópico',
  'An experimental open-source AI agent that autonomously achieves goals': 'Um agente de IA experimental de código aberto que alcança objetivos de forma autônoma',
  'A simple AI agent using task-driven autonomous execution': 'Um agente de IA simples usando execução autônoma orientada por tarefas',
  'Framework for orchestrating AI agents that collaborate to achieve complex goals': 'Framework para orquestrar agentes de IA autônomos com papéis definidos',
  'Autonomous AI agent that can browse the web and execute tasks': 'Agente de IA autônomo que pode navegar na web e executar tarefas',
  'Build multi-agent teams with graph-based workflows': 'Construa equipes multi-agente com fluxos de trabalho baseados em grafos',
  'Multi-agent conversation framework with customizable agents': 'Framework de conversação multi-agente com agentes personalizáveis',
  'Minimal implementation of a general AI agent': 'Implementação mínima de um agente de IA geral'
};

// Additional AI agents to make the data more comprehensive
const additionalAgents = [
  {
    id: 'agent-05',
    name: 'AgentGPT',
    description: 'Autonomous AI agent that can browse the web and execute tasks',
    type: 'ai-agent',
    category: 'Autonomous Agents',
    official: false,
    stars_numeric: 1800,
    tags: ['autonomous', 'web', 'tasks']
  },
  {
    id: 'agent-06',
    name: 'LangGraph',
    description: 'Build multi-agent teams with graph-based workflows',
    type: 'ai-agent',
    category: 'AI Development',
    official: false,
    stars_numeric: 1600,
    tags: ['graph', 'workflow', 'multi-agent']
  },
  {
    id: 'agent-07',
    name: 'AutoGen',
    description: 'Multi-agent conversation framework with customizable agents',
    type: 'ai-agent',
    category: 'Multi-agent Systems',
    official: false,
    stars_numeric: 1900,
    tags: ['conversation', 'framework', 'customizable']
  },
  {
    id: 'agent-08',
    name: 'SmolAGI',
    description: 'Minimal implementation of a general AI agent',
    type: 'ai-agent',
    category: 'AI Development',
    official: false,
    stars_numeric: 1200,
    tags: ['minimal', 'implementation', 'general']
  }
];

// Combine original data with additional agents
const allAgents = [...aiAgentsData, ...additionalAgents];

async function insertAIAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to PostgreSQL database');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if AI agents already exist
    const existingAgents = await client.query(
      "SELECT COUNT(*) as count FROM products WHERE product_type = 'ai_agent'"
    );
    
    console.log(`📊 Current AI agents in database: ${existingAgents.rows[0].count}`);
    
    // Insert each AI agent
    let insertedCount = 0;
    
    for (const agent of allAgents) {
      const slug = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const namePt = translations[agent.name] || agent.name;
      const descriptionPt = translations[agent.description] || agent.description;
      
      try {
        // Check if this agent already exists
        const existingAgent = await client.query(
          'SELECT id FROM products WHERE name = $1 AND product_type = $2',
          [agent.name, 'ai_agent']
        );
        
        if (existingAgent.rows.length > 0) {
          console.log(`⚠️  Agent "${agent.name}" already exists, skipping...`);
          continue;
        }
        
        // Insert the agent
        const result = await client.query(`
          INSERT INTO products (
            name, description, product_type, category, official, stars_numeric, 
            tags, is_active, is_featured, name_en, name_pt, description_en, 
            description_pt, language_code, created_at, updated_at, slug
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id, name
        `, [
          agent.name,
          agent.description,
          'ai_agent',
          agent.category,
          agent.official,
          agent.stars_numeric,
          agent.tags,
          true, // is_active
          agent.stars_numeric > 2000, // is_featured for popular agents
          agent.name, // name_en
          namePt, // name_pt
          agent.description, // description_en
          descriptionPt, // description_pt
          'en', // language_code
          new Date(), // created_at
          new Date(), // updated_at
          slug
        ]);
        
        console.log(`✅ Inserted: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        insertedCount++;
        
      } catch (error) {
        console.error(`❌ Error inserting ${agent.name}:`, error.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Verify insertions
    const finalCount = await client.query(
      "SELECT COUNT(*) as count FROM products WHERE product_type = 'ai_agent'"
    );
    
    console.log(`\n🎉 Successfully inserted ${insertedCount} AI agents!`);
    console.log(`📈 Total AI agents in database: ${finalCount.rows[0].count}`);
    
    // Show inserted agents
    const agents = await client.query(`
      SELECT id, name, name_pt, category, stars_numeric, is_featured
      FROM products 
      WHERE product_type = 'ai_agent' 
      ORDER BY stars_numeric DESC
    `);
    
    console.log('\n📋 AI Agents in database:');
    agents.rows.forEach(agent => {
      console.log(`   ${agent.name} (${agent.name_pt}) - ${agent.category} - ⭐${agent.stars_numeric} ${agent.is_featured ? '🌟' : ''}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting AI agents:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the insertion
insertAIAgents().catch(console.error);