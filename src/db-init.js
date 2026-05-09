require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  const schemaPath = path.join(__dirname, '../migrations/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.connect();
    await pool.query(sql);
    console.log('Database schema initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
