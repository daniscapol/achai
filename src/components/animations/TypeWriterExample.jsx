import React from 'react';
import { TypeWriter } from './index';

/**
 * Example component showcasing the TypeWriter component usage
 * This can be used as a reference or directly in the HomePage
 */
const TypeWriterExample = () => {
  // Example text phrases that will be typed in sequence
  const textPhrases = [
    "Find the perfect MCP server for your project",
    "Enhance Claude with powerful tools",
    "Connect to databases, APIs, and more",
    "Discover new capabilities for your AI workflows"
  ];
  
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        <TypeWriter 
          texts={textPhrases}
          typingSpeed={70}
          deletingSpeed={40}
          delayAfterType={2000}
          delayAfterDelete={700}
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-400 min-h-[40px]"
        />
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mt-4">
        Browse our marketplace to extend Claude's capabilities with Model Context Protocol servers
      </p>
    </div>
  );
};

export default TypeWriterExample;