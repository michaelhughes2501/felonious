const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Try to load env from backend-node if not in root
if (!process.env.DB_USER) {
  require('dotenv').config({ path: path.join(__dirname, '../backend-node/.env') });
}

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS === 'yourpassword' ? '' : (process.env.DB_PASS || ''),
    multipleStatements: true
  });

  try {
    console.log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema...');
    await connection.query(schema);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
