import { z } from 'zod';
import { db } from '../db';
import { chainResults } from '../db/schema';
import { eq } from 'drizzle-orm';

// Zod schema for validating chain result creation
export const createChainResultSchema = z.object({
  sessionId: z.string().uuid(),
  chainId: z.number().int().min(1),
  chainName: z.string().min(1),
  chainColor: z.string().optional(),
  chainEmoji: z.string().optional(),
  status: z.string().min(1),
  position: z.number().int().optional(),
  completed: z.boolean().default(false),
  txCompleted: z.number().int().min(0),
  txTotal: z.number().int().min(1),
  txLatencies: z.array(z.number()).default([]),
  averageLatency: z.number().int().optional(),
  totalLatency: z.number().int().optional(),
  txHash: z.string().optional(),
  error: z.string().optional(),
});

export type CreateChainResultInput = z.infer<typeof createChainResultSchema>;

export class ChainResultModel {
  /**
   * Create a new chain result
   */
  static async create(data: CreateChainResultInput) {
    try {
      const [result] = await db.insert(chainResults)
        .values({
          sessionId: data.sessionId,
          chainId: data.chainId,
          chainName: data.chainName,
          chainColor: data.chainColor,
          chainEmoji: data.chainEmoji,
          status: data.status,
          position: data.position,
          completed: data.completed,
          txCompleted: data.txCompleted,
          txTotal: data.txTotal,
          txLatencies: data.txLatencies,
          averageLatency: data.averageLatency,
          totalLatency: data.totalLatency,
          txHash: data.txHash,
          error: data.error,
        })
        .returning();

      return result;
    } catch (error) {
      console.error('Error creating chain result:', error);
      throw new Error('Failed to create chain result');
    }
  }

  /**
   * Create multiple chain results in a transaction
   */
  static async createMany(results: CreateChainResultInput[]) {
    if (results.length === 0) {
      return [];
    }

    try {
      // Insert each result individually since we're having TypeScript issues
      // with the bulk insert operation
      const createdResults = [];
      
      for (const result of results) {
        // Ensure that required fields are present
        if (!result.sessionId || !result.chainId || !result.chainName || 
            !result.status || result.txTotal === undefined) {
          throw new Error('Missing required fields for chain result');
        }
        
        const created = await this.create(result);
        createdResults.push(created);
      }

      return createdResults;
    } catch (error) {
      console.error('Error creating multiple chain results:', error);
      throw new Error('Failed to create chain results');
    }
  }

  /**
   * Get chain results for a specific race session
   */
  static async getBySessionId(sessionId: string) {
    try {
      const results = await db.select()
        .from(chainResults)
        .where(eq(chainResults.sessionId, sessionId))
        .orderBy(chainResults.position);

      return results;
    } catch (error) {
      console.error('Error fetching chain results for session:', error);
      throw new Error('Failed to fetch chain results');
    }
  }

  /**
   * Update a chain result
   */
  static async update(id: number, data: Partial<CreateChainResultInput>) {
    try {
      const [updated] = await db.update(chainResults)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(chainResults.id, id))
        .returning();

      return updated;
    } catch (error) {
      console.error('Error updating chain result:', error);
      throw new Error('Failed to update chain result');
    }
  }

  /**
   * Delete all chain results for a session
   */
  static async deleteBySessionId(sessionId: string) {
    try {
      await db.delete(chainResults)
        .where(eq(chainResults.sessionId, sessionId));

      return true;
    } catch (error) {
      console.error('Error deleting chain results:', error);
      throw new Error('Failed to delete chain results');
    }
  }
}