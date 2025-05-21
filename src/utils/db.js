import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load environment variables for PostgreSQL Connection
const dbConfig = {
  user: process.env.DB_USER || 'achai',
  host: process.env.DB_HOST || 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: process.env.DB_NAME || 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  connectionTimeoutMillis: 10000, // 10 second timeout
  ssl: { rejectUnauthorized: false }
};

// Log connection attempt
console.log(`Connecting to PostgreSQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);

// Create a new PostgreSQL pool
let pool;
let dbConnected = false;
let connectionAttempted = false;

try {
  // Create a connection pool to the database
  pool = new pg.Pool(dbConfig);

  // Test the connection
  console.log('Attempting to connect to PostgreSQL database...');
  pool.query('SELECT NOW()', (err, res) => {
    connectionAttempted = true;
    if (err) {
      console.error('Database connection error:', err);
      console.error(`Could not connect to ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
      console.log('API server requires a connection to the database');
      dbConnected = false;
    } else {
      console.log('PostgreSQL database connected successfully!');
      dbConnected = true;
    }
  });
} catch (error) {
  connectionAttempted = true;
  console.error('Error creating database pool:', error);
  console.log('API server requires a connection to the database');
  dbConnected = false;
}

// Set a timeout to check if connection was successful
setTimeout(() => {
  if (!connectionAttempted) {
    console.error('Connection attempt timed out. Check your network and database settings.');
    dbConnected = false;
  }
}, 5000);

// Query method for database
const query = async (text, params) => {
  try {
    if (!dbConnected) {
      throw new Error('Database connection required. Cannot execute query without database connection.');
    }
    
    return await pool.query(text, params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Test connection function
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    dbConnected = true;
    return true;
  } catch (error) {
    dbConnected = false;
    console.error('Connection test failed:', error);
    throw error;
  }
};

// Check if database is connected
const isConnected = () => {
  return dbConnected;
};

// Get data source info
const getDataSourceInfo = () => {
  if (dbConnected) {
    return {
      type: 'success',
      source: 'postgres',
      message: 'Connected to PostgreSQL database',
      host: dbConfig.host,
      database: dbConfig.database
    };
  } else {
    return {
      type: 'error',
      source: 'none',
      message: 'No database connection available',
      error: 'Database connection required'
    };
  }
};

// Get fallback data message
const getFallbackDataMessage = () => {
  return {
    type: dbConnected ? 'success' : 'error',
    message: dbConnected 
      ? 'Connected to PostgreSQL database' 
      : 'Database connection required. No fallback available.',
    usingFallback: false
  };
};

// Export methods to be used throughout the application
export default {
  query,
  isConnected,
  testConnection,
  getFallbackDataMessage,
  getDataSourceInfo
};