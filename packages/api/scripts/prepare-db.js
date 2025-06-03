#!/usr/bin/env node

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const dbName = process.env.DATABASE_NAME || 'chain_derby';

async function prepareDatabase() {
  // First, connect to the default postgres database
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if the database exists
    const checkResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [dbName]);

    // If the database doesn't exist, create it
    if (checkResult.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist, creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error('Error preparing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

prepareDatabase().then(() => {
  console.log('Database preparation completed');
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});