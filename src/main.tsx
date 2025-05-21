import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/animations/Toast'

// Navigation fix is loaded directly from index.html via permanent-fix.js
// No need to load additional scripts dynamically

// Set up a global event listener for client navigation
window.addEventListener('storage', (event) => {
  // When client data changes, dispatch event for components
  if (event.key === 'mcp_clients_data' || event.key === 'mcp_clients_data_updated') {
    window.dispatchEvent(new CustomEvent('client_data_updated'));
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StrictMode>
  );
}