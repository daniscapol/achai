import React from 'react';
import { useTranslation } from 'react-i18next';

const WhatIsAnMcpServerPage = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
          {t('what_is_mcp.hero.title')}
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {t('what_is_mcp.hero.subtitle')}
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
        </div>
      </div>

      {/* Main Content with Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* What is MCP Card */}
        <div className="bg-zinc-800/60 rounded-xl p-8 border border-zinc-700 shadow-lg transform transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-500/40 hover:shadow-xl">
          <div className="text-purple-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-100">{t('what_is_mcp.cards.universal_connector.title')}</h2>
          <p className="text-gray-300">
            An MCP Server (Model Context Protocol Server) acts as the critical link that connects Large Language Models (LLMs) like Claude to your data sources and tools. Think of it as a universal adapter that allows AI systems to access information from databases, company files, or online services without complex custom setups.
          </p>
        </div>

        {/* Why MCP Matters Card */}
        <div className="bg-zinc-800/60 rounded-xl p-8 border border-zinc-700 shadow-lg transform transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-500/40 hover:shadow-xl">
          <div className="text-purple-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Why MCP Servers Matter</h2>
          <ul className="text-gray-300 space-y-3 list-disc list-inside">
            <li><span className="text-purple-400 font-medium">Simplified Integration</span>: Connect AI to your tools and data with standardized protocols instead of building custom connections for each source.</li>
            <li><span className="text-purple-400 font-medium">Enhanced AI Capabilities</span>: Give your AI applications the context they need to provide more accurate, relevant, and personalized responses.</li>
            <li><span className="text-purple-400 font-medium">Data Control & Security</span>: Control exactly what information your AI can access while maintaining data security and privacy.</li>
            <li><span className="text-purple-400 font-medium">Rapid Deployment</span>: Deploy AI solutions in days rather than months with pre-built servers for popular services.</li>
          </ul>
        </div>

        {/* Who Benefits Card */}
        <div className="bg-zinc-800/60 rounded-xl p-8 border border-zinc-700 shadow-lg transform transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-500/40 hover:shadow-xl">
          <div className="text-purple-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Who Benefits from MCP Servers?</h2>
          <div className="space-y-3 text-gray-300">
            <div>
              <h3 className="font-semibold text-purple-400">Developers</h3>
              <p>Building AI-powered applications who need simplified access to diverse data sources.</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400">Businesses</h3>
              <p>Looking to enhance customer service with AI chatbots that can access company information.</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400">Research Teams</h3>
              <p>Using AI to process and analyze data from multiple sources.</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400">IT Departments</h3>
              <p>Seeking standardized ways to connect internal systems with AI tools.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MCP in Action Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-12 text-center">MCP Servers in Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Use Case 1 */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Development Environments</h3>
            <p className="text-gray-300">Connect AI assistants to your codebase, helping developers with smarter code suggestions, bug detection, and documentation.</p>
          </div>

          {/* Use Case 2 */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Business Tools Integration</h3>
            <p className="text-gray-300">Link your AI to platforms like Slack, Google Drive, or project management tools to automate workflows and answer employee questions instantly.</p>
          </div>

          {/* Use Case 3 */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Database Access</h3>
            <p className="text-gray-300">Enable AI to query your databases directly, generating reports and providing data-driven insights without manual data extraction.</p>
          </div>

          {/* Use Case 4 */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Web Automation</h3>
            <p className="text-gray-300">Automate repetitive web tasks like form filling, data collection, or content updates through AI with web access capabilities.</p>
          </div>

          {/* Use Case 5 */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Internal Systems</h3>
            <p className="text-gray-300">Connect AI to your company's proprietary systems, allowing employees to use natural language to find information and complete tasks.</p>
          </div>

          {/* Use Case 6 - Empty for balance */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 rounded-lg overflow-hidden shadow-lg p-6 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-full bg-purple-900/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Custom Applications</h3>
            <p className="text-gray-300">Build specialized AI-powered applications tailored to your industry needs with easy access to relevant data sources and tools.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-10 text-center mb-16 border border-purple-700/30 shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to Connect?</h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Explore pre-built servers, or contact our team to learn how MCP Servers can transform your team's AI capabilities.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="#/browse-categories" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
          >
            Browse MCP Servers
          </a>
          <a 
            href="#/submit" 
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg border border-purple-500/30"
          >
            Submit Your MCP Server
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-xl font-bold mb-2 text-gray-100">What is the difference between an MCP Server and an API?</h3>
            <p className="text-gray-300">
              While APIs provide programmatic access to services, MCP Servers are specifically designed to connect AI models to data sources and tools using a standardized protocol. MCP Servers handle the complex translation between AI requests and the underlying data or service they provide access to.
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-xl font-bold mb-2 text-gray-100">How secure are MCP Servers?</h3>
            <p className="text-gray-300">
              MCP Servers are designed with security in mind. They provide granular control over what data AI systems can access, and include mechanisms for authentication, authorization, and data validation. Each MCP Server can implement its own security measures appropriate to the sensitivity of the data it handles.
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-xl font-bold mb-2 text-gray-100">Can I build my own MCP Server?</h3>
            <p className="text-gray-300">
              Yes! The MCP protocol is open, allowing developers to create custom servers that connect AI to their specific tools and data sources. The MCP marketplace provides examples, libraries, and best practices to help you build your own servers.
            </p>
          </div>
        </div>
      </div>
      
      {/* Get Started Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Getting Started is Easy</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          The MCP marketplace includes pre-built servers for popular services. Whether you're a developer ready to implement the full protocol or a business user looking for plug-and-play solutions, MCP Servers offer flexible options to fit your needs.
        </p>
        <a 
          href="#/" 
          className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-900/40 transform hover:-translate-y-1"
        >
          Explore the Marketplace
        </a>
      </div>
    </div>
  );
};

export default WhatIsAnMcpServerPage;