import request from 'supertest';
import app from '../../src/index';
import { RaceSessionModel } from '../../src/models';

// Mock the model methods
jest.mock('../../src/models/raceSession.model', () => {
  return {
    createRaceSessionSchema: {
      parse: jest.fn((data) => data),
    },
    raceSessionFilterSchema: {
      parse: jest.fn((data) => data),
    },
    RaceSessionModel: {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      getWithResults: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock('../../src/models/chainResult.model', () => {
  return {
    createChainResultSchema: {
      parse: jest.fn((data) => data),
    },
    ChainResultModel: {
      create: jest.fn(),
      createMany: jest.fn(),
      getBySessionId: jest.fn(),
      update: jest.fn(),
      deleteBySessionId: jest.fn(),
    },
  };
});

describe('Race Session API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/race-sessions', () => {
    it('should return all race sessions', async () => {
      const mockSessions = [
        {
          id: 1,
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Race 1',
          walletAddress: '0x123456789abcdef',
          transactionCount: 10,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (RaceSessionModel.getAll as jest.Mock).mockResolvedValueOnce(mockSessions);

      const response = await request(app.callback())
        .get('/api/race-sessions')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSessions);
    });
  });

  describe('GET /api/race-sessions/:id', () => {
    it('should return a race session by ID', async () => {
      const mockSession = {
        id: 1,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Race 1',
        walletAddress: '0x123456789abcdef',
        transactionCount: 10,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        results: [
          {
            id: 1,
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            chainId: 1,
            chainName: 'Ethereum',
            status: 'success',
            position: 1,
            txCompleted: 10,
            txTotal: 10,
            txLatencies: [100, 150, 120],
            averageLatency: 123,
            totalLatency: 1230,
          },
        ],
      };

      (RaceSessionModel.getWithResults as jest.Mock).mockResolvedValueOnce(mockSession);

      const response = await request(app.callback())
        .get('/api/race-sessions/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSession);
    });

    it('should return 404 when race session is not found', async () => {
      (RaceSessionModel.getWithResults as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app.callback())
        .get('/api/race-sessions/nonexistent-id')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/race-sessions', () => {
    it('should create a new race session with results', async () => {
      const mockSessionInput = {
        title: 'Test Race',
        walletAddress: '0x123456789abcdef',
        transactionCount: 10,
      };

      const mockResultsInput = [
        {
          chainId: 1,
          chainName: 'Ethereum',
          status: 'success',
          position: 1,
          txCompleted: 10,
          txTotal: 10,
          txLatencies: [100, 150, 120],
          averageLatency: 123,
          totalLatency: 1230,
        },
      ];

      const mockCreatedSession = {
        id: 1,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        ...mockSessionInput,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCreatedResults = [
        {
          id: 1,
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          ...mockResultsInput[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (RaceSessionModel.create as jest.Mock).mockResolvedValueOnce(mockCreatedSession);
      (require('../../src/models/chainResult.model').ChainResultModel.createMany as jest.Mock)
        .mockResolvedValueOnce(mockCreatedResults);

      const response = await request(app.callback())
        .post('/api/race-sessions')
        .send({
          session: mockSessionInput,
          results: mockResultsInput,
        })
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data.results).toHaveLength(1);
    });
  });

  describe('DELETE /api/race-sessions/:id', () => {
    it('should delete a race session', async () => {
      (require('../../src/models/chainResult.model').ChainResultModel.deleteBySessionId as jest.Mock)
        .mockResolvedValueOnce(true);
      (RaceSessionModel.delete as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app.callback())
        .delete('/api/race-sessions/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when race session to delete is not found', async () => {
      (require('../../src/models/chainResult.model').ChainResultModel.deleteBySessionId as jest.Mock)
        .mockResolvedValueOnce(true);
      (RaceSessionModel.delete as jest.Mock).mockResolvedValueOnce(false);

      const response = await request(app.callback())
        .delete('/api/race-sessions/nonexistent-id')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});