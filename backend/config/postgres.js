const { Pool } = require('pg');

const isProduction = process.env.RAILWAY_ENVIRONMENT !== undefined;

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'ciphersql_sandbox',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

  // 🚀 Railway needs SSL
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL Connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL client error:', err);
});

module.exports = pool;