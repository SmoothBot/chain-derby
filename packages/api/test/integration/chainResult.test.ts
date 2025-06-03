import request from 'supertest';
import app from '../../src/index';
import { ChainResultModel } from '../../src/models/chainResult.model';

// Mock the model methods
jest.mock('../../src/models/chainResult.model', () => {
  return {
    ChainResultModel: {
      getBySessionId: jest.fn(),
    },
  };
});

describe('Chain Result API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/chain-results/session/:sessionId', () => {
    it('should return chain results for a specific session', async () => {
      const mockResults = [
        {
          id: 1,
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          chainId: 1,
          chainName: 'Ethereum',
          chainColor: '#627EEA',
          chainEmoji: '🐎',
          status: 'success',
          position: 1,
          completed: true,
          txCompleted: 10,
          txTotal: 10,
          txLatencies: [100, 150, 120],
          averageLatency: 123,
          totalLatency: 1230,
          txHash: '0xabcdef1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          chainId: 2,
          chainName: 'RISE Testnet',
          chainColor: '#7967E5',
          chainEmoji: '🐎',
          status: 'success',
          position: 2,
          completed: true,
          txCompleted: 10,
          txTotal: 10,
          txLatencies: [150, 200, 180],
          averageLatency: 177,
          totalLatency: 1770,
          txHash: '0x1234567890abcdef',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (ChainResultModel.getBySessionId as jest.Mock).mockResolvedValueOnce(mockResults);

      const response = await request(app.callback())
        .get('/api/chain-results/session/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResults);
      expect(ChainResultModel.getBySessionId).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return empty array when no results are found', async () => {
      (ChainResultModel.getBySessionId as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app.callback())
        .get('/api/chain-results/session/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/chain-results/stats', () => {
    it('should return statistics message', async () => {
      const response = await request(app.callback())
        .get('/api/chain-results/stats')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });
  });
});