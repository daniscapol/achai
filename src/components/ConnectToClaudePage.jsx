import React from 'react';

const ConnectToClaudePage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl">
        {/* Imagem representativa - idealmente, salvaríamos a imagem original ou usaríamos uma similar */}
        <img src="/assets/claude_connect_illustration.png" alt="Connect Claude with your tools" className="w-64 h-auto mx-auto mb-8 rounded-lg shadow-xl" />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
          Connect Claude with Your Favorite Tools
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Seamlessly integrate Claude Desktop with platforms like Shopify, Figma, QuickBooks, and Jira. Transform your workflow with powerful automations and integrations.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Powerful Integrations</h3>
            <p className="text-gray-400">Connect with your essential business tools effortlessly.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Smart Automation</h3>
            <p className="text-gray-400">Let Claude handle repetitive tasks across your tools.</p>
          </div>
        </div>

        <button 
          onClick={() => alert('Thank you for your interest! Waitlist functionality is coming soon.')} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Join Waitlist &rarr;
        </button>

        <div className="mt-12 text-gray-400">
            <h4 className="text-xl font-semibold text-gray-200 mb-3">What tools will be supported?</h4>
            <p>We're starting with the most popular productivity and development tools, and we'll continuously add more based on user feedback.</p>
        </div>

      </div>
    </div>
  );
};

export default ConnectToClaudePage;

