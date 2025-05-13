import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config()

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: (process.env.DATABASE_URL as string) || 'postgres://postgres:postgres@localhost:5432/chain_derby',
  },
  verbose: true,
  strict: true,
} satisfies Config;