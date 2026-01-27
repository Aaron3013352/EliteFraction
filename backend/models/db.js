const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Successfully connected to the database');
});

pool.on('error', (err) => {
  console.error('Error with the database connection:', err);
});

module.exports = pool;
