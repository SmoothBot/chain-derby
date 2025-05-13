// Mock database connection
jest.mock('../src/db', () => {
  return {
    db: {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    },
    pool: {
      end: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.API_KEY = 'test_api_key';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/chain_derby_test';
process.env.CORS_ORIGIN = 'http://localhost:3000';