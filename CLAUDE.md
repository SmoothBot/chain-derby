# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with three main packages:
- `/packages/app/` - Next.js frontend application (main application)
- `/packages/api/` - Koa.js API server with PostgreSQL backend
- `/packages/grafana/` - Grafana monitoring and analytics

## Build Commands

### Frontend App (`/packages/app/`)
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application with Turbopack  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### API Server (`/packages/api/`)
- `npm run dev` - Development server with hot reload
- `npm run build` - TypeScript compilation
- `npm run start` - Production server
- `npm run test` - Jest test suite
- `npm run lint` - ESLint checking
- `npm run migration:generate` - Generate database migrations
- `npm run migration:push` - Apply database migrations
- `npm run db:setup` - Start Docker containers and initialize database

### Grafana (`/packages/grafana/`)
- `docker build -t chain-derby-grafana .` - Build Grafana Docker image
- `docker run -p 3000:3000 chain-derby-grafana` - Run Grafana container

## Code Style Guidelines
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Build Tool**: Turbopack for faster development and builds
- **Imports**: Use absolute imports with path aliases (e.g., `@/components`, `@/hooks`)
- **Component structure**: 
  - Use React functional components with TypeScript types
  - Client components should use "use client" directive
  - Props should be typed with Readonly for immutability
- **Naming**: 
  - PascalCase for components and their files
  - camelCase for variables, functions, and hooks
- **Styling**: Tailwind CSS v4 with class-variance-authority for variants
- **Type safety**: Enable strict TypeScript mode, prefer explicit types
- **Error handling**: Use try/catch blocks with appropriate error messaging
- **UI Components**: Use Radix UI primitives combined with custom styling
- **State management**: React hooks with context providers when needed

## Application Architecture

### Overview
Chain Derby is a blockchain transaction speed racing application that compares transaction latency across multiple EVM-compatible and Solana networks. Users can:
1. Generate embedded wallets (EVM and Solana)
2. Fund wallets on multiple blockchain networks
3. Execute parallel transactions across all selected chains
4. Measure and compare real-time transaction confirmation times
5. View race results with detailed performance metrics

### Supported Networks
- **EVM Chains**: RISE Testnet, Monad Testnet, MegaETH Testnet, Sonic Mainnet, Base Sepolia
- **Non-EVM**: Solana Testnet
- Each chain has specific optimizations (custom RPC methods, gas settings, fallback endpoints)

### Key Architecture Components

#### Provider Hierarchy
```
WagmiProvider (blockchain integration)
├── QueryClientProvider (data fetching)
    ├── ThemeProvider (dark/light mode)
        ├── ChainRaceProvider (core race logic)
            ├── PageProvider (page state)
                └── ModalProvider (modal management)
```

#### Core Hooks
- `useChainRace`: Central hook managing race state, balances, transaction processing
- `useEmbeddedWallet`: EVM wallet generation and management (viem/wagmi)
- `useSolanaEmbeddedWallet`: Solana wallet generation and management
- `useModal`: Global modal state management

#### Blockchain Integration
- **EVM**: Uses viem/wagmi v2 for blockchain interactions
- **Solana**: Uses @solana/web3.js with custom wallet management
- **Chain Configuration**: Centralized in `/chain/config.ts` and `/chain/networks.ts`
- **Multi-Chain Support**: Parallel transaction processing with chain-specific optimizations

#### Main Components
- `ChainRace`: Main racing visualization and controller
- `EmbeddedWallet`: Wallet display and management for both EVM and Solana
- `FundingPhase`: UI for funding wallets across chains with balance validation
- `RaceController`: Race start/stop controls with pre-transaction validation
- `LeaderboardPanel`: Real-time race results and rankings
- `Scoreboard`: Detailed performance metrics and transaction data

#### API Backend (`/packages/api/`)
- **Framework**: Koa.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Three main tables (race_sessions, chain_results, transaction_details)
- **Validation**: Zod for schema validation
- **Testing**: Jest test suite

#### State Flow
1. Generate embedded wallets on first load (both EVM and Solana)
2. User funds wallets across selected chains with balance validation
3. Race starts by pre-signing and sending parallel transactions
4. Real-time tracking of transaction confirmations with latency measurement
5. Results displayed with rankings, timing data, and transaction hashes
6. Optional data persistence via API backend

#### Key TypeScript Interfaces
- `ChainRaceStatus`: Race phases (idle, funding, ready, racing, finished)
- `ChainBalance`: Balance information per chain (chainId, balance, hasBalance, error)
- `RaceResult`: Core race tracking with performance metrics, styling, hashes, latencies
- `TransactionCount`: Number of transactions per chain (fixed at 10)
- `ChainConfig`: Extends viem's Chain with UI properties (color, emoji, logo)
- `ModalContextType` & `ModalProps`: Application-wide modal management
- `PageContextType`: Page-level state and view preferences

#### Performance Optimizations
- Pre-signed transactions for faster execution
- Parallel transaction processing across all chains
- Strategic RPC endpoint fallbacks for reliability
- Minimal re-renders with stable state management
- Chain-specific optimizations (custom RPC methods, gas settings)