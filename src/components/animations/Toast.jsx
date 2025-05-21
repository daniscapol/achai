import React, { createContext, useContext } from 'react';

// Create a context for toast management
const ToastContext = createContext();

/**
 * Simplified Provider component for the toast system
 */
export const ToastProvider = ({ children }) => {
  // Simplified toast functions
  const toast = {
    info: (message) => console.log('Info toast:', message),
    success: (message) => console.log('Success toast:', message),
    error: (message) => console.log('Error toast:', message),
    warning: (message) => console.log('Warning toast:', message),
  };
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use the toast system
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

export default ToastProvider;