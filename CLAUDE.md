# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build the application with turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **Framework**: Next.js with React 19 and TypeScript
- **Imports**: Use absolute imports with path aliases (e.g., `@/components`, `@/hooks`)
- **Component structure**: 
  - Use React functional components with TypeScript types
  - Client components should use "use client" directive
  - Props should be typed with Readonly for immutability
- **Naming**: 
  - PascalCase for components and their files
  - camelCase for variables, functions, and hooks
- **Styling**: Use Tailwind CSS with class-variance-authority for variants
- **Type safety**: Enable strict TypeScript mode, prefer explicit types
- **Error handling**: Use try/catch blocks with appropriate error messaging
- **UI Components**: Use Radix UI primitives combined with custom styling
- **State management**: React hooks with context providers when needed

## Application Architecture

### Overview
This is an EVM Chain Race application that compares transaction speeds across different EVM-compatible blockchains. It allows users to:
1. Generate an embedded wallet
2. Fund the wallet on multiple blockchains
3. Run a race by executing transactions across all chains simultaneously
4. View real-time race progress and results

### Key Architecture Components

#### Providers
- `ChainRaceProvider`: Core state container for the racing functionality
- `WagmiProvider`: Handles blockchain interactions with the wagmi library
- `ThemeProvider`: Manages light/dark mode with next-themes
- `QueryClientProvider`: Manages data fetching with React Query
- `ModalProvider`: Handles application modals
- `PageProvider`: Manages page-level state
- `SidebarProvider`: Controls the sidebar UI state

#### Blockchain Integration
- Uses viem/wagmi for blockchain interactions
- `useEmbeddedWallet`: Hook for creating and managing in-browser wallets
- `useChainRace`: Core hook managing the race state, balances, and transaction processing
- Chain configuration is in `chain/config.ts` and `chain/networks.ts`

#### Main Components
- `EmbeddedWallet`: Shows and manages wallet details
- `FundingPhase`: UI for funding wallets across chains
- `RaceController`: Controls race state (start, reset)
- `HorseRace`: Visual representation of the racing chains
- `Scoreboard`: Shows results and timing data

#### State Flow
1. Wallet is generated on first load via `useEmbeddedWallet`
2. User funds wallet on different chains
3. Race starts by sending parallel transactions to each chain
4. Real-time updates track transaction confirmation times
5. Results are displayed with rankings and timing data

#### Data Models
- `ChainRaceStatus`: Tracks race phases (idle, funding, ready, racing, finished)
- `ChainBalance`: Stores balance information for each chain
- `RaceResult`: Tracks race progress and results for each chain