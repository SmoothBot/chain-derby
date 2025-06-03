# Chain Derby

A blockchain transaction speed racing application that compares transaction latency across EVM-compatible networks.

## Overview

Chain Derby sends parallel transactions to multiple blockchain networks and measures confirmation times. Users can compare performance across different chains through a racing interface.

## Features

- Parallel transaction testing across multiple EVM chains
- Embedded wallet generation and management
- Real-time transaction confirmation tracking
- Performance metrics and race results
- Support for RISE, Monad, MegaETH, Sonic, Base, and Base Sepolia
- Dark/light mode
- Testnet faucet integration

## Technology Stack

- Next.js 15 with React 19 and TypeScript
- Viem/Wagmi for blockchain interactions
- Tailwind CSS v4
- Radix UI components
- Turbopack build tool

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/SmoothBot/horse-race.git
   cd horse-race/packages/app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## How It Works

1. Generate embedded wallet (stored locally)
2. Fund wallet using provided faucet links
3. Select chains for testing
4. Send parallel transactions and measure confirmation times
5. View results and performance metrics

## Supported Networks

- RISE Testnet
- Monad Testnet
- MegaETH Testnet
- Sonic
- Base
- Base Sepolia

## Project Structure

```
packages/app/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── chain/           # Blockchain configurations
│   ├── hooks/           # Custom hooks
│   ├── providers/       # Context providers
│   └── lib/             # Utilities
└── public/              # Static assets
```

## Important

This tool compares Layer 1 and Layer 2 confirmations, which have different security models. Faster confirmation times do not indicate better security or decentralization. 

**Do Your Own Research** - Networks vary in security assumptions, finality guarantees, decentralization, and economic security.

Educational purposes only.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new chains, fixing bugs, and improving the application.

## License

MIT License