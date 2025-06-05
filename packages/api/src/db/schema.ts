import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  json,
  text,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

// Race Session Table - represents a full race session
export const raceSessions = pgTable('race_sessions', {
  id: serial('id').primaryKey(),
  // A unique identifier for the race session - make it unique for foreign key references
  sessionId: uuid('session_id').notNull().defaultRandom().unique(),
  // Title/name of the race session (optional)
  title: varchar('title', { length: 255 }),
  // User-provided notes or description
  description: text('description'),
  // The wallet address that created the race
  walletAddress: varchar('wallet_address', { length: 42 }),
  // Number of transactions run in the race (1, 5, 10, 20)
  transactionCount: integer('transaction_count').notNull(),
  // Race status (completed, abandoned, etc.)
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  // User's country
  country: varchar('country', { length: 50 }),
  // User's region (state/province)
  region: varchar('region', { length: 100 }),
  // User's city
  city: varchar('city', { length: 100 }),
  // Location coordinates (latitude,longitude)
  coordinates: varchar('coordinates', { length: 50 }),
  // Internet service provider
  isp: varchar('isp', { length: 200 }),
  // User's timezone
  timezone: varchar('timezone', { length: 50 }),
  // Client browser session ID
  browserSession: varchar('browser_session', { length: 255 }),
  // Timestamp when race was created
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // Timestamp when race was updated
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chain Results Table - stores individual chain results for each race
export const chainResults = pgTable('chain_results', {
  id: serial('id').primaryKey(),
  // Foreign key to race_sessions
  sessionId: uuid('session_id').notNull().references(() => raceSessions.sessionId, { onDelete: 'cascade' }),
  // Chain ID (e.g., 1 for Ethereum mainnet)
  chainId: integer('chain_id').notNull(),
  // Chain name
  chainName: varchar('chain_name', { length: 100 }).notNull(),
  // Chain color code for UI
  chainColor: varchar('chain_color', { length: 50 }),
  // Chain emoji icon
  chainEmoji: varchar('chain_emoji', { length: 10 }),
  // Final status of the chain in the race (success, error, etc.)
  status: varchar('status', { length: 50 }).notNull(),
  // Race completion position (1st, 2nd, etc.)
  position: integer('position'),
  // Whether the chain completed all transactions
  completed: boolean('completed').notNull().default(false),
  // Number of completed transactions
  txCompleted: integer('tx_completed').notNull().default(0),
  // Total number of transactions attempted
  txTotal: integer('tx_total').notNull(),
  // Array of transaction latencies in milliseconds
  txLatencies: json('tx_latencies').notNull().default([]),
  // Average transaction latency in milliseconds
  averageLatency: integer('average_latency'),
  // Total latency of all transactions combined
  totalLatency: integer('total_latency'),
  // Transaction hash of the last transaction
  txHash: varchar('tx_hash', { length: 66 }),
  // Error message if the chain failed
  error: text('error'),
  // Timestamp when record was created
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // Timestamp when record was updated
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Detailed Transaction Data - stores detailed data for each transaction
export const transactionDetails = pgTable('transaction_details', {
  id: serial('id').primaryKey(),
  // Foreign key to chain_results
  chainResultId: integer('chain_result_id').notNull().references(() => chainResults.id, { onDelete: 'cascade' }),
  // Transaction index in the batch
  txIndex: integer('tx_index').notNull(),
  // Transaction hash
  txHash: varchar('tx_hash', { length: 66 }),
  // Time taken to confirm this transaction in milliseconds
  latency: integer('latency').notNull(),
  // Block number where transaction was confirmed
  blockNumber: integer('block_number'),
  // Raw transaction data for reference
  rawData: json('raw_data'),
  // Location information (copied from race session)
  country: varchar('country', { length: 50 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  // Timestamp when record was created
  createdAt: timestamp('created_at').notNull().defaultNow(),
});