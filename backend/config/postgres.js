const { Pool } = require('pg');

let pool;

if (process.env.PG_CONNECTION_STRING) {
  pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });
} else {
  
  pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'ciphersql_sandbox',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD
  });
}

pool.on('connect', () => {
  console.log('✅ PostgreSQL Connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Error:', err);
});

module.exports = pool;