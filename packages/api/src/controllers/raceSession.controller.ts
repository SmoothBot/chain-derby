import { Context } from 'koa';
import { ZodError } from 'zod';
import {
  RaceSessionModel,
  createRaceSessionSchema,
  raceSessionFilterSchema,
} from '../models/raceSession.model';
import { ChainResultModel, createChainResultSchema } from '../models/chainResult.model';
import { TransactionDetailModel, createTransactionDetailSchema } from '../models/transactionDetail.model';

export class RaceSessionController {
  /**
   * Create a new race session with chain results
   */
  static async create(ctx: Context) {
    try {
      // Extract data from the request body - expecting the new format from frontend
      const payload = ctx.request.body as {
        title: string;
        walletAddress: string;
        transactionCount: number;
        status: 'completed';
        city?: string;
        region?: string;
        country?: string;
        results: Array<{
          chainId: number;
          chainName: string;
          txLatencies: number[];
          averageLatency: number;
          totalLatency: number;
          status: string;
          position?: number;
        }>;
      };

      // Add browser session from headers
      const browserSession = ctx.request.headers['x-session-id'] as string || '';
      
      // Create session data from payload
      const sessionData = {
        title: payload.title,
        walletAddress: payload.walletAddress,
        transactionCount: payload.transactionCount,
        status: payload.status,
        country: payload.country || '',
        region: payload.region,
        city: payload.city || '',
        browserSession,
      };

      // Validate session data
      const validatedSession = createRaceSessionSchema.parse(sessionData);
      
      // Create the race session
      const createdSession = await RaceSessionModel.create(validatedSession);
      
      // If there are chain results, process them
      if (Array.isArray(payload.results) && payload.results.length > 0) {
        const createdResults = [];
        
        for (const result of payload.results) {
          // Create chain result
          const chainResultData = {
            sessionId: createdSession.sessionId,
            chainId: result.chainId,
            chainName: result.chainName,
            status: result.status,
            position: result.position,
            completed: true, // All results from frontend are completed
            txCompleted: result.txLatencies.length,
            txTotal: result.txLatencies.length,
            txLatencies: result.txLatencies,
            averageLatency: result.averageLatency,
            totalLatency: result.totalLatency,
          };

          const validatedChainResult = createChainResultSchema.parse(chainResultData);
          const createdChainResult = await ChainResultModel.create(validatedChainResult);
          
          // Create transaction details for each transaction latency
          const transactionDetails = result.txLatencies.map((latency, index) => ({
            chainResultId: createdChainResult.id,
            txIndex: index,
            latency: latency,
            country: payload.country,
            region: payload.region,
            city: payload.city,
          }));

          // Create all transaction details for this chain
          await TransactionDetailModel.createMany(transactionDetails);
          
          createdResults.push(createdChainResult);
        }
        
        // Return the created session with its results
        ctx.status = 201;
        ctx.body = {
          success: true,
          data: {
            ...createdSession,
            results: createdResults,
          },
        };
      } else {
        // Return just the created session if no results were provided
        ctx.status = 201;
        ctx.body = {
          success: true,
          data: createdSession,
        };
      }
    } catch (error) {
      ctx.status = error instanceof ZodError ? 400 : 500;
      ctx.body = {
        success: false,
        error: error instanceof ZodError 
          ? { message: 'Validation error', details: error.errors } 
          : { message: 'Internal server error' },
      };
    }
  }

  /**
   * Get all race sessions with optional filtering
   */
  static async getAll(ctx: Context) {
    try {
      // Validate and extract query parameters
      const filters = raceSessionFilterSchema.parse(ctx.query);
      
      // Get all sessions with the applied filters
      const sessions = await RaceSessionModel.getAll(filters);
      
      ctx.body = {
        success: true,
        data: sessions,
      };
    } catch (error) {
      ctx.status = error instanceof ZodError ? 400 : 500;
      ctx.body = {
        success: false,
        error: error instanceof ZodError 
          ? { message: 'Validation error', details: error.errors } 
          : { message: 'Failed to fetch race sessions' },
      };
    }
  }

  /**
   * Get a race session by ID
   */
  static async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // Check if ID is provided
      if (!id) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: { message: 'Session ID is required' },
        };
        return;
      }
      
      // Get the session with all its results
      const session = await RaceSessionModel.getWithResults(id);
      
      if (!session) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: { message: 'Race session not found' },
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: session,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: { message: 'Failed to fetch race session' },
      };
    }
  }

  /**
   * Delete a race session by ID
   */
  static async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // Check if ID is provided
      if (!id) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: { message: 'Session ID is required' },
        };
        return;
      }
      
      // First delete associated chain results
      await ChainResultModel.deleteBySessionId(id);
      
      // Then delete the session
      const deleted = await RaceSessionModel.delete(id);
      
      if (!deleted) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: { message: 'Race session not found' },
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: { message: 'Race session deleted successfully' },
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: { message: 'Failed to delete race session' },
      };
    }
  }
}