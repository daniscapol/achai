import React from 'react';

const ReadyToUsePageSimple = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white text-center mb-8">Ready to Use AI Solutions</h1>
      <p className="text-xl text-gray-300 text-center mb-8">
        This is a simple test page to verify routing is working correctly.
      </p>
      <div className="flex justify-center">
        <button 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default ReadyToUsePageSimple;