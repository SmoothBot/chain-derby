import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  security: {
    corsOrigin: string;
    apiKey: string;
  };
  ipInfo: {
    token: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/chain_derby'
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    apiKey: process.env.API_KEY || 'development_api_key',
  },
  ipInfo: {
    token: process.env.IPINFO_TOKEN || '',
  },
};

export default config;