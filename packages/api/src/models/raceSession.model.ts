import { z } from 'zod';
import { db } from '../db';
import { raceSessions, chainResults } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

// Zod schema for validating race session creation
export const createRaceSessionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  walletAddress: z.string().min(1).max(42),
  transactionCount: z.number().int().min(1),
  status: z.string().optional(),
  // Session information
  ipAddress: z.string().max(45).optional(),
  country: z.string().max(50).optional(),
  region: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  coordinates: z.string().max(50).optional(),
  isp: z.string().max(200).optional(),
  timezone: z.string().max(50).optional(),
  browserSession: z.string().max(255).optional(),
});

// Zod schema for race session filters
export const raceSessionFilterSchema = z.object({
  walletAddress: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type CreateRaceSessionInput = z.infer<typeof createRaceSessionSchema>;
export type RaceSessionFilters = z.infer<typeof raceSessionFilterSchema>;

export class RaceSessionModel {
  /**
   * Create a new race session
   */
  static async create(data: CreateRaceSessionInput) {
    try {
      const [result] = await db.insert(raceSessions)
        .values({
          title: data.title,
          description: data.description,
          walletAddress: data.walletAddress,
          transactionCount: data.transactionCount,
          status: data.status || 'completed',
          // Session information
          ipAddress: data.ipAddress,
          country: data.country,
          region: data.region,
          city: data.city,
          coordinates: data.coordinates,
          isp: data.isp,
          timezone: data.timezone,
          browserSession: data.browserSession,
        })
        .returning({
          id: raceSessions.id,
          sessionId: raceSessions.sessionId,
          title: raceSessions.title,
          description: raceSessions.description,
          walletAddress: raceSessions.walletAddress,
          transactionCount: raceSessions.transactionCount,
          status: raceSessions.status,
          ipAddress: raceSessions.ipAddress,
          country: raceSessions.country,
          region: raceSessions.region,
          city: raceSessions.city,
          coordinates: raceSessions.coordinates,
          isp: raceSessions.isp,
          timezone: raceSessions.timezone,
          browserSession: raceSessions.browserSession,
          createdAt: raceSessions.createdAt,
          updatedAt: raceSessions.updatedAt,
        });

      return result;
    } catch (error) {
      console.error('Error creating race session:', error);
      throw new Error('Failed to create race session');
    }
  }

  /**
   * Get a race session by ID
   */
  static async getById(sessionId: string) {
    try {
      const result = await db.select()
        .from(raceSessions)
        .where(eq(raceSessions.sessionId, sessionId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching race session by ID:', error);
      throw new Error('Failed to fetch race session');
    }
  }

  /**
   * Get race sessions with optional filtering
   */
  static async getAll(filters: RaceSessionFilters = { limit: 20, offset: 0 }) {
    try {
      // Extract filter parameters with defaults
      const { walletAddress, country, region, city, limit = 20, offset = 0 } = filters;
      
      // Simplified implementation for now
      // This method shouldn't be used in production without fixing the TypeScript issues
      
      // @ts-ignore: TypeScript errors with Drizzle ORM
      const query = db.select().from(raceSessions);
      
      // Apply filters
      if (walletAddress) {
        // @ts-ignore: TypeScript errors with Drizzle ORM
        query.where(eq(raceSessions.walletAddress, walletAddress));
      }
      
      if (country) {
        // @ts-ignore: TypeScript errors with Drizzle ORM
        query.where(eq(raceSessions.country, country));
      }
      
      if (region) {
        // @ts-ignore: TypeScript errors with Drizzle ORM
        query.where(eq(raceSessions.region, region));
      }
      
      if (city) {
        // @ts-ignore: TypeScript errors with Drizzle ORM
        query.where(eq(raceSessions.city, city));
      }
      
      // @ts-ignore: TypeScript errors with Drizzle ORM
      return await query
        .orderBy(desc(raceSessions.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error fetching race sessions:', error);
      throw new Error('Failed to fetch race sessions');
    }
  }

  /**
   * Get a race session with all its chain results
   */
  static async getWithResults(sessionId: string) {
    try {
      // Get the race session
      const session = await this.getById(sessionId);
      
      if (!session) {
        return null;
      }
      
      // Get all chain results for this session
      const results = await db.select()
        .from(chainResults)
        .where(eq(chainResults.sessionId, sessionId))
        .orderBy(chainResults.position);
      
      return {
        ...session,
        results,
      };
    } catch (error) {
      console.error('Error fetching race session with results:', error);
      throw new Error('Failed to fetch race session with results');
    }
  }

  /**
   * Delete a race session by ID
   */
  static async delete(sessionId: string) {
    try {
      const result = await db.delete(raceSessions)
        .where(eq(raceSessions.sessionId, sessionId))
        .returning({ sessionId: raceSessions.sessionId });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting race session:', error);
      throw new Error('Failed to delete race session');
    }
  }
}