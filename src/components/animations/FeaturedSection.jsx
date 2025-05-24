import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * FeaturedSection - A premium featured products section that maintains the same visual style
 * as the DynamicHeroSection. Now with category-based grouping.
 */
const FeaturedSection = ({ 
  title = "Featured AI Solutions",
  description = "Discover powerful AI solutions to enhance your workflows",
  featuredProducts = [],
  onViewAll,
  onProductSelect,
  className = ""
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [translatedProducts, setTranslatedProducts] = useState([]);

  // Translation function for product data
  const translateProductData = useCallback((productData) => {
    if (currentLanguage !== 'pt') {
      return productData;
    }
    
    const translations = {
      // Generic patterns
      'Connect to': 'Conecte-se a',
      'Interact with': 'Interaja com',
      'Access': 'Acesse',
      'Manage': 'Gerencie',
      'Control': 'Controle',
      'through MCP': 'através do MCP',
      'via MCP': 'via MCP',
      'with MCP': 'com MCP',
      'MCP integration': 'integração MCP',
      'MCP server': 'servidor MCP',
      'MCP client': 'cliente MCP',
      'AI agent': 'agente de IA',
      'autonomous': 'autônomo',
      'framework': 'framework',
      
      // Complete descriptions for fallback
      'Server for connecting to PostgreSQL databases via MCP': 'Servidor para conectar a bancos de dados PostgreSQL via MCP',
      'GitHub integration server for MCP': 'Servidor de integração GitHub para MCP',
      'Web search capabilities through MCP': 'Capacidades de pesquisa web através do MCP',
      'File system access via MCP': 'Acesso ao sistema de arquivos via MCP',
      // Common Names - MCP Servers
      'PostgreSQL MCP Server': 'Servidor MCP PostgreSQL',
      'GitHub MCP Server': 'Servidor MCP GitHub',
      'Web Search MCP Server': 'Servidor MCP Pesquisa Web',
      'File System MCP Server': 'Servidor MCP Sistema de Arquivos',
      'Slack MCP Server': 'Servidor MCP Slack',
      'Discord MCP Server': 'Servidor MCP Discord',
      'Google Drive MCP Server': 'Servidor MCP Google Drive',
      'Notion MCP Server': 'Servidor MCP Notion',
      'Airtable MCP Server': 'Servidor MCP Airtable',
      'SQLite MCP Server': 'Servidor MCP SQLite',
      'MySQL MCP Server': 'Servidor MCP MySQL',
      'MongoDB MCP Server': 'Servidor MCP MongoDB',
      'Redis MCP Server': 'Servidor MCP Redis',
      'Docker MCP Server': 'Servidor MCP Docker',
      'Kubernetes MCP Server': 'Servidor MCP Kubernetes',
      'AWS MCP Server': 'Servidor MCP AWS',
      'Azure MCP Server': 'Servidor MCP Azure',
      'GCP MCP Server': 'Servidor MCP GCP',
      
      // AI Agents
      'GPT Researcher': 'GPT Pesquisador',
      'Auto-GPT': 'Auto-GPT',
      'BabyAGI': 'BabyAGI',
      'AgentGPT': 'AgentGPT',
      'LangGraph': 'LangGraph',
      'CrewAI': 'CrewAI',
      'AutoGen': 'AutoGen',
      'SmolAGI': 'SmolAGI',
      
      // MCP Clients
      'MCP CLI Client': 'Cliente MCP CLI',
      'Claude Desktop': 'Claude Desktop',
      'VSCode MCP Extension': 'Extensão MCP VSCode',
      
      // Common Descriptions - MCP Servers
      'Connect to PostgreSQL databases through MCP': 'Conecte-se a bancos de dados PostgreSQL através do MCP',
      'Interact with GitHub repositories, issues, and PRs through MCP': 'Interaja com repositórios GitHub, issues e PRs através do MCP',
      'Perform web searches through MCP': 'Realize pesquisas na web através do MCP',
      'Access file system operations through MCP': 'Acesse operações do sistema de arquivos através do MCP',
      'Access Slack workspaces and channels through MCP': 'Acesse workspaces e canais do Slack através do MCP',
      'Connect to Discord servers and channels through MCP': 'Conecte-se a servidores e canais do Discord através do MCP',
      'Access Google Drive files and folders through MCP': 'Acesse arquivos e pastas do Google Drive através do MCP',
      'Interact with Notion databases and pages through MCP': 'Interaja com bancos de dados e páginas do Notion através do MCP',
      'Connect to Airtable bases and tables through MCP': 'Conecte-se a bases e tabelas do Airtable através do MCP',
      'Access SQLite databases through MCP': 'Acesse bancos de dados SQLite através do MCP',
      'Connect to MySQL databases through MCP': 'Conecte-se a bancos de dados MySQL através do MCP',
      'Connect to MongoDB databases through MCP': 'Conecte-se a bancos de dados MongoDB através do MCP',
      'Access Redis cache through MCP': 'Acesse cache Redis através do MCP',
      'Manage Docker containers through MCP': 'Gerencie contêineres Docker através do MCP',
      'Control Kubernetes clusters through MCP': 'Controle clusters Kubernetes através do MCP',
      'Access AWS services through MCP': 'Acesse serviços AWS através do MCP',
      'Connect to Azure services through MCP': 'Conecte-se a serviços Azure através do MCP',
      'Integrate with Google Cloud Platform through MCP': 'Integre com Google Cloud Platform através do MCP',
      
      // AI Agents Descriptions (covering all possible descriptions)
      'An autonomous agent for conducting thorough web research on any topic': 'Um agente autônomo para conduzir pesquisas web completas sobre qualquer tópico',
      'An experimental open-source AI agent that autonomously achieves goals': 'Um agente de IA experimental de código aberto que alcança objetivos de forma autônoma',
      'A simple AI agent using task-driven autonomous execution': 'Um agente de IA simples usando execução autônoma orientada por tarefas',
      'Autonomous AI agent that can browse the web and execute tasks': 'Agente de IA autônomo que pode navegar na web e executar tarefas',
      'Build multi-agent teams with graph-based workflows': 'Construa equipes multi-agente com fluxos de trabalho baseados em grafos',
      'Framework for orchestrating role-playing autonomous AI agents': 'Framework para orquestrar agentes de IA autônomos com papéis definidos',
      'Multi-agent conversation framework with customizable agents': 'Framework de conversação multi-agente com agentes personalizáveis',
      'Minimal implementation of a general AI agent': 'Implementação mínima de um agente de IA geral',
      'Autonomous Data (Labeling) Agent framework for building AI agents': 'Framework de Agente Autônomo de Dados (Rotulagem) para construir agentes de IA',
      'Recommender system simulator with 1,000 agents for recommendation tasks': 'Simulador de sistema de recomendação com 1.000 agentes para tarefas de recomendação',
      'LLM-agnostic platform for agent building and testing with multi-agent support': 'Plataforma agnóstica a LLM para construção e teste de agentes com suporte multi-agente',
      'Command line interface for interacting with MCP servers': 'Interface de linha de comando para interagir com servidores MCP',
      'Official desktop application for Claude with MCP integration': 'Aplicação desktop oficial para Claude com integração MCP',
      'Visual Studio Code extension for MCP integration': 'Extensão do Visual Studio Code para integração MCP',
      'A tool that bridges desktop Claude app with the Model Context Protocol (MCP)': 'Uma ferramenta que conecta o aplicativo Claude desktop com o Protocolo de Contexto de Modelo (MCP)',
      'Popular code editor with MCP integration for AI-powered development assistance.': 'Editor de código popular com integração MCP para assistência de desenvolvimento com IA.',
      'AI-powered code editor with MCP integration for advanced code completion and editing.': 'Editor de código alimentado por IA com integração MCP para autocompletar e edição avançada.',
      'AI-first code editor that makes you extraordinarily productive': 'Editor de código com IA que te torna extraordinariamente produtivo',
      'The editor for tomorrow, today': 'O editor para o amanhã, hoje',
      'High-performance, multiplayer code editor from the creators of Atom and Tree-sitter': 'Editor de código de alta performance e multiplayer dos criadores do Atom e Tree-sitter',
      
      // Categories
      'Code Editor': 'Editor de Código',
      'Development Tool': 'Ferramenta de Desenvolvimento',
      'CLI Tools': 'Ferramentas CLI',
      'File Systems': 'Sistemas de Arquivos',
      'Remote Storage': 'Armazenamento Remoto',
      'Coding Assistant': 'Assistente de Codificação',
      'CLI Tool': 'Ferramenta CLI',
      'Terminal': 'Terminal',
      'Desktop Applications': 'Aplicações Desktop',
      'Communication': 'Comunicação',
      'Cloud Storage': 'Armazenamento em Nuvem',
      'Productivity': 'Produtividade',
      'Databases': 'Bancos de Dados',
      'Version Control': 'Controle de Versão',
      'Web & Search': 'Web e Pesquisa',
      'Research & Knowledge': 'Pesquisa e Conhecimento',
      'Autonomous Agents': 'Agentes Autônomos',
      'Task Management': 'Gerenciamento de Tarefas',
      'Multi-Agent Systems': 'Sistemas Multi-Agente',
      'AI Development': 'Desenvolvimento de IA',
      'IDE Extensions': 'Extensões IDE',
      'Container Management': 'Gerenciamento de Contêineres',
      'Cloud Services': 'Serviços em Nuvem'
    };
    
    // Smart translation with fallback for partial matches
    const translateText = (text) => {
      if (!text) return text;
      
      // First try exact match
      if (translations[text]) return translations[text];
      
      // Then try partial replacements for common patterns
      let translatedText = text;
      Object.keys(translations).forEach(key => {
        if (key.length > 5 && text.includes(key)) { // Only replace longer phrases to avoid conflicts
          translatedText = translatedText.replace(new RegExp(key, 'gi'), translations[key]);
        }
      });
      
      return translatedText;
    };

    return {
      ...productData,
      name: translateText(productData.name),
      description: translateText(productData.description),
      shortDescription: translateText(productData.shortDescription) || translateText(productData.description),
      longDescription: translateText(productData.longDescription) || translateText(productData.description),
      category: translateText(productData.category),
      categories: productData.categories?.map(cat => translateText(cat)) || productData.categories
    };
  }, [currentLanguage]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300); // Delay rendering by 300ms
    
    return () => clearTimeout(timer);
  }, []);

  // Update translated products when language or featuredProducts change
  useEffect(() => {
    const translated = featuredProducts.map(product => translateProductData(product));
    setTranslatedProducts(translated);
  }, [featuredProducts, currentLanguage, translateProductData]);
  
  // Group products by category type using translated products
  const categorizedProducts = translatedProducts.reduce((acc, product) => {
    const categoryType = product.categoryType || 'other';
    if (!acc[categoryType]) {
      acc[categoryType] = [];
    }
    acc[categoryType].push(product);
    return acc;
  }, {});
  
  // Dynamic category type configuration based on available categories
  const getCategoryConfig = (categoryType) => {
    const baseConfigs = {
      'ready-to-use': {
        title: t('categories.ready_to_use.title'),
        description: t('categories.ready_to_use.description'),
        gradient: 'from-red-600 to-orange-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        bgClass: 'bg-red-900/20',
        borderClass: 'border-red-500/30',
        badgeClass: 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
      },
      'mcp-client': {
        title: t('categories.mcp_clients.title'),
        description: t('categories.mcp_clients.description'),
        gradient: 'from-blue-600 to-cyan-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        bgClass: 'bg-blue-900/20',
        borderClass: 'border-blue-500/30',
        badgeClass: 'bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border-blue-500/30'
      },
      'mcp-server': {
        title: t('categories.mcp_servers.title'),
        description: t('categories.mcp_servers.description'),
        gradient: 'from-purple-600 to-indigo-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
        ),
        bgClass: 'bg-purple-900/20',
        borderClass: 'border-purple-500/30',
        badgeClass: 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border-purple-500/30'
      },
      'ai-agent': {
        title: t('categories.ai_agents.title'),
        description: t('categories.ai_agents.description'),
        gradient: 'from-amber-500 to-orange-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
        bgClass: 'bg-amber-900/20',
        borderClass: 'border-amber-500/30',
        badgeClass: 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-500/30'
      }
    };

    // Return the config for the given category type, or a default for unknown types
    return baseConfigs[categoryType] || {
      title: categoryType.charAt(0).toUpperCase() + categoryType.slice(1).replace(/-/g, ' '),
      description: `Discover ${categoryType.replace(/-/g, ' ')} solutions`,
      gradient: 'from-zinc-600 to-gray-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bgClass: 'bg-zinc-900/20',
      borderClass: 'border-zinc-500/30',
      badgeClass: 'bg-gradient-to-r from-zinc-500/20 to-gray-500/20 border-zinc-500/30'
    };
  };

  // Get available categories dynamically
  const availableCategories = Object.keys(categorizedProducts).filter(category => 
    categorizedProducts[category] && categorizedProducts[category].length > 0
  );
  
  if (!isReady) return null; // Don't render until ready
  
  return (
    <section className={`relative py-20 overflow-hidden ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-900/90"></div>
        
        {/* Static background shape for better performance */}
        <div 
          className="absolute right-0 top-1/4 w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-indigo-600/5 to-transparent blur-3xl opacity-40"
        />
        
        <div 
          className="absolute left-0 bottom-1/4 w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-purple-600/5 to-transparent blur-3xl opacity-30"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              All Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                {title}
              </span>
            </h2>
            
            {/* Dynamic category pills based on available categories */}
            <div className="flex flex-wrap gap-2 my-4">
              {availableCategories.map((categoryType) => {
                const config = getCategoryConfig(categoryType);
                const gradientClass = config.gradient.replace('from-', 'from-').replace('to-', 'to-').replace('-600', '-500/10').replace('-500', '-500/10');
                const borderClass = config.borderClass.replace('border-', 'border-').replace('/30', '/20');
                const textClass = config.borderClass.replace('border-', 'text-').replace('/30', '').replace('500', '300');
                
                return (
                  <span 
                    key={categoryType}
                    className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${gradientClass} border ${borderClass} ${textClass} text-xs`}
                  >
                    {config.title}
                  </span>
                );
              })}
            </div>
            
            <p className="text-zinc-400 mt-2 max-w-xl">
              {description}
            </p>
          </motion.div>
          
          <motion.button
            onClick={onViewAll}
            className="mt-4 md:mt-0 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-purple-500/30 backdrop-blur-sm rounded-lg group transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isReady ? 1 : 0, x: isReady ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
          >
            <span className="flex items-center">
{t('homepage.featured.view_all_short')}
              <svg 
                className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
          </motion.button>
        </div>
        
        {/* Category sections */}
        {availableCategories.map((categoryType, categoryIndex) => {
          const products = categorizedProducts[categoryType] || [];
          if (products.length === 0) return null;
          
          const config = getCategoryConfig(categoryType);
          
          return (
            <div key={categoryType} className="mb-16 last:mb-0">
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 1 + (0.1 * categoryIndex) }}
              >
                {/* Category header with icon and distinct styling */}
                <div className={`px-5 py-4 rounded-xl ${config.bgClass} border ${config.borderClass} backdrop-blur-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${config.gradient}`}>
                      <span className="text-white">{config.icon}</span>
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full ${config.badgeClass} text-sm font-medium mb-1`}>
                        {t('common.category')}
                      </span>
                      <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                        {config.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-zinc-300 ml-[52px]">{config.description}</p>
                </div>
              </motion.div>
              
              {/* Products grid for this category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={`featured-${categoryType}-${index}-${product.id || 'no-id'}-${(product.name || 'unknown').replace(/[^a-zA-Z0-9]/g, '-')}`}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 1.5 + (0.05 * Math.min(index, 5)) + (0.2 * categoryIndex) }}
                    onHoverStart={() => setHoveredIndex(`${categoryType}-${index}`)}
                    onHoverEnd={() => setHoveredIndex(null)}
                  >
                    <div 
                      className={`relative overflow-hidden bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md border ${config.borderClass} hover:${config.borderClass} rounded-xl p-6 transition-all duration-300 cursor-pointer group h-full shadow-xl hover:shadow-2xl`}
                      onClick={() => onProductSelect(product)}
                    >
                      {/* Category indicator at top */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.gradient}`}></div>
                      
                      {/* Category badge */}
                      <div className={`absolute top-3 left-3 ${config.badgeClass} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2`}>
                        <span className="w-4 h-4 flex-shrink-0">{config.icon}</span>
                        <span className="whitespace-nowrap">{config.title}</span>
                      </div>
                      
                      {/* Shine effect */}
                      <motion.div 
                        className="absolute inset-0 w-1/5 h-full bg-white/10 -skew-x-12 -translate-x-full group-hover:translate-x-[500%] transition-transform duration-1000"
                        animate={{ opacity: hoveredIndex === `${categoryType}-${index}` ? 1 : 0 }}
                      />
                      
                      {/* Enhanced glow effect on hover */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      
                      {/* Content */}
                      <div className="flex flex-col h-full pt-10 mt-3">
                        {/* Product image with fallback to icon */}
                        <div className="mb-4 relative">
                          {product.image_url || product.imageUrl || product.logo ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-2 bg-white/5 border border-white/10 flex items-center justify-center p-2">
                              <img 
                                src={product.image_url || product.imageUrl || product.logo} 
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              {/* Fallback icon (hidden by default, shown on image error) */}
                              <div className={`absolute inset-0 w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-br ${product.gradient || config.gradient} hidden`}>
                                <span className="text-white text-xl">
                                  {config.icon}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Icon circle with gradient background (fallback) */
                            <div className={`w-20 h-20 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br ${product.gradient || config.gradient}`}>
                              <span className="text-white text-xl">
                                {config.icon}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className={`text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${config.gradient} transition-all duration-300`}>
                          {product.name}
                        </h3>
                        
                        <p className="text-zinc-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {product.tags && product.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(FeaturedSection);