import React, { useState, useEffect } from 'react';

/**
 * Displays an alert message regarding the current data source status
 * Shows whether the application is using AWS database or if there's a connection issue
 */
const DataStatusAlert = () => {
  const [dataStatus, setDataStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch data status from the API
  useEffect(() => {
    const fetchDataStatus = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/data-status`);
        if (response.ok) {
          const data = await response.json();
          setDataStatus(data);
          
          // Store the status globally so other components can access it
          window.currentDataStatus = data;
          
          // Set window.usingFallbackData based on the status
          window.usingFallbackData = data.type === 'error';
        } else {
          setDataStatus({
            type: 'error',
            message: 'Failed to connect to AWS database. All data requires AWS database connection.',
            source: 'none'
          });
          window.usingFallbackData = true;
        }
      } catch (error) {
        console.error('Error fetching data status:', error);
        setDataStatus({
          type: 'error',
          message: 'AWS Database connection required. Cannot proceed without database connection.',
          source: 'none'
        });
        window.usingFallbackData = true;
      }
    };

    fetchDataStatus();
    
    // Refresh the status every 30 seconds to detect changes
    const intervalId = setInterval(fetchDataStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // If no data status or user dismissed the alert, don't render anything
  if (!dataStatus || !isVisible) {
    return null;
  }

  // Only show error alerts - don't show success messages about database connection
  if (dataStatus.type !== 'error') {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-between animate-pulse" role="alert">
      <div className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>
          <strong>AWS Database Required:</strong> {dataStatus.message}
        </span>
      </div>
      <button 
        onClick={() => setIsVisible(false)} 
        className="text-white hover:text-gray-100"
        aria-label="Dismiss"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
};

export default DataStatusAlert;