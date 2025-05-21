import pg from 'pg';

// Database configuration using environment variables
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
  statement_timeout: 10000,
};

console.log('DB Config:', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  hasPassword: !!dbConfig.password
});

let pool;

function getPool() {
  if (!pool) {
    pool = new pg.Pool(dbConfig);
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
}

export function getDataSourceInfo() {
  return {
    type: 'success',
    source: 'postgres',
    message: 'Connected to PostgreSQL database',
    host: dbConfig.host,
    database: dbConfig.database
  };
}