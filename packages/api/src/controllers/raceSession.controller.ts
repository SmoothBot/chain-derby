import { Context } from 'koa';
import { ZodError } from 'zod';
import {
  RaceSessionModel,
  createRaceSessionSchema,
  raceSessionFilterSchema,
} from '../models/raceSession.model';
import { ChainResultModel, createChainResultSchema } from '../models/chainResult.model';
import { getIpInfo, extractLocationData } from '../services/ipInfo.service';

export class RaceSessionController {
  /**
   * Create a new race session with chain results
   */
  static async create(ctx: Context) {
    try {
      // Extract data from the request body
      const { session, results } = ctx.request.body as {
        session: any;
        results: any[];
      };

      // Get the request IP address
      const ipAddress = ctx.request.ip || ctx.request.ips?.[0] || '127.0.0.1';
      const browserSession = ctx.request.headers['x-session-id'] as string || '';
      
      // Fetch IP information if not already provided
      let sessionWithIpInfo = { ...session };
      
      if (!session.ipAddress) {
        try {
          // Get IP information from ipinfo.io
          const ipInfo = await getIpInfo(ipAddress);
          const locationData = extractLocationData(ipInfo);
          
          // Merge with session data
          sessionWithIpInfo = {
            ...sessionWithIpInfo,
            ...locationData,
            browserSession,
          };
        } catch (ipError) {
          console.error('Error fetching IP info:', ipError);
          // Continue with just the IP address
          sessionWithIpInfo.ipAddress = ipAddress;
          sessionWithIpInfo.browserSession = browserSession;
        }
      }

      // Validate session data
      const validatedSession = createRaceSessionSchema.parse(sessionWithIpInfo);
      
      // Create the race session
      const createdSession = await RaceSessionModel.create(validatedSession);
      
      // If there are chain results, validate and create them
      if (Array.isArray(results) && results.length > 0) {
        // Validate each result and add the session ID
        const validatedResults = results.map((result) => {
          const validatedResult = createChainResultSchema.parse({
            ...result,
            sessionId: createdSession.sessionId,
          });
          return validatedResult;
        });

        // Create all chain results
        const createdResults = await ChainResultModel.createMany(validatedResults);
        
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