export class ApiKeyManager {
  constructor() {
    this.keys = new Map();
    this.tempStorage = new Map();
  }

  storeKey(service, apiKey, persist = true) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(`API key for ${service} cannot be empty`);
    }

    if (persist) {
      // Store in localStorage by default now
      localStorage.setItem(`agent_api_key_${service}`, apiKey);
    } else {
      // Store in memory for session only
      this.tempStorage.set(service, apiKey);
    }
    
    this.keys.set(service, apiKey);
  }

  getKey(service) {
    // Check memory first
    if (this.keys.has(service)) {
      return this.keys.get(service);
    }

    // Check temp storage
    if (this.tempStorage.has(service)) {
      const key = this.tempStorage.get(service);
      this.keys.set(service, key);
      return key;
    }

    // Check localStorage
    const storedKey = localStorage.getItem(`agent_api_key_${service}`);
    if (storedKey) {
      this.keys.set(service, storedKey);
      return storedKey;
    }

    return null;
  }

  removeKey(service) {
    this.keys.delete(service);
    this.tempStorage.delete(service);
    localStorage.removeItem(`agent_api_key_${service}`);
  }

  clearAllKeys() {
    this.keys.clear();
    this.tempStorage.clear();
    
    // Remove all stored API keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('agent_api_key_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  validateKey(service, apiKey) {
    const validations = {
      openai: (key) => key.startsWith('sk-') && key.length > 20,
      mailchimp: (key) => key.includes('-') && key.length > 30,
      sendgrid: (key) => key.startsWith('SG.') && key.length > 60,
      resend: (key) => key.startsWith('re_') && key.length > 30,
      mailgun: (key) => key.startsWith('key-') && key.length > 30,
      hubspot: (key) => key.length > 30,
      notion: (key) => key.startsWith('secret_') && key.length > 40,
      anthropic: (key) => key.startsWith('sk-ant-') && key.length > 20
    };

    const validator = validations[service.toLowerCase()];
    if (!validator) {
      console.warn(`No validator for service: ${service}`);
      return true; // Allow if no specific validation
    }

    return validator(apiKey);
  }

  hasKey(service) {
    return this.getKey(service) !== null;
  }

  listAvailableServices() {
    const services = new Set();
    
    // Add from memory
    this.keys.forEach((_, service) => services.add(service));
    
    // Add from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('agent_api_key_')) {
        const service = key.replace('agent_api_key_', '');
        services.add(service);
      }
    }

    return Array.from(services);
  }
}

// Global instance
export const apiKeyManager = new ApiKeyManager();