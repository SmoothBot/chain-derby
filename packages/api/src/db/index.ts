import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import config from '../config';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Initialize Drizzle ORM with the PostgreSQL pool
export const db = drizzle(pool);

// Export the pool for use in migrations
export { pool };