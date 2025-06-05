import { z } from 'zod';
import { db } from '../db';
import { transactionDetails } from '../db/schema';
import { eq } from 'drizzle-orm';

// Zod schema for validating transaction detail creation
export const createTransactionDetailSchema = z.object({
  chainResultId: z.number().int().min(1),
  txIndex: z.number().int().min(0),
  txHash: z.string().optional(),
  latency: z.number().int().min(0),
  blockNumber: z.number().int().optional(),
  rawData: z.any().optional(),
  // Location information (from race session)
  country: z.string().max(50).optional(),
  region: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

export type CreateTransactionDetailInput = z.infer<typeof createTransactionDetailSchema>;

export class TransactionDetailModel {
  /**
   * Create a new transaction detail
   */
  static async create(data: CreateTransactionDetailInput) {
    try {
      const [result] = await db.insert(transactionDetails)
        .values({
          chainResultId: data.chainResultId,
          txIndex: data.txIndex,
          txHash: data.txHash,
          latency: data.latency,
          blockNumber: data.blockNumber,
          rawData: data.rawData,
          country: data.country,
          region: data.region,
          city: data.city,
        })
        .returning();

      return result;
    } catch (error) {
      console.error('Error creating transaction detail:', error);
      throw new Error('Failed to create transaction detail');
    }
  }

  /**
   * Create multiple transaction details in a batch
   */
  static async createMany(details: CreateTransactionDetailInput[]) {
    if (details.length === 0) {
      return [];
    }

    try {
      const createdDetails = [];
      
      for (const detail of details) {
        const created = await this.create(detail);
        createdDetails.push(created);
      }

      return createdDetails;
    } catch (error) {
      console.error('Error creating multiple transaction details:', error);
      throw new Error('Failed to create transaction details');
    }
  }

  /**
   * Get transaction details for a specific chain result
   */
  static async getByChainResultId(chainResultId: number) {
    try {
      const results = await db.select()
        .from(transactionDetails)
        .where(eq(transactionDetails.chainResultId, chainResultId))
        .orderBy(transactionDetails.txIndex);

      return results;
    } catch (error) {
      console.error('Error fetching transaction details for chain result:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  /**
   * Delete all transaction details for a chain result
   */
  static async deleteByChainResultId(chainResultId: number) {
    try {
      await db.delete(transactionDetails)
        .where(eq(transactionDetails.chainResultId, chainResultId));

      return true;
    } catch (error) {
      console.error('Error deleting transaction details:', error);
      throw new Error('Failed to delete transaction details');
    }
  }
}