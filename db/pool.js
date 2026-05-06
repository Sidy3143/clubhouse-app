const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, 
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected PG error', err)
  process.exit(1)
})


module.exports = pool;