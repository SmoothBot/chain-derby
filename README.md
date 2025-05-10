# Chain Derby

This repository contains a Next.js application designed to compare the performance of the **RISE testnet** against other EVM-compatible blockchains. The application provides a visual race track to directly compare transaction speeds and latencies across different chains.

## Purpose

The primary goal of this application is to:

1. Demonstrate the superior performance of the RISE testnet compared to other EVM chains
2. Provide a visual and interactive way to measure transaction latencies 
3. Compare both average and total latency metrics across multiple transactions
4. Showcase the benefits of RISE's high-performance blockchain architecture

## Features

- Interactive race visualization showing real-time transaction progress
- Support for multiple transaction count modes (1, 5, 10, or 20 transactions)
- Detailed metrics including average latency and total latency
- Embedded wallet for easy testing across multiple chains
- Simple funding process with faucet links
- Pre-signed transaction optimization for accurate timing
- Dark mode support

## Supported Chains

The application currently supports racing against these EVM-compatible chains:
- RISE Testnet
- Monad Testnet
- MegaETH Testnet
- Base Mainnet
- Sonic Mainnet

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

1. An embedded wallet is automatically generated and stored in your browser
2. Fund your wallet using the provided faucet links for each chain
3. Select the number of transactions to run (default is 10, but you can choose 1, 5, or 20)
4. Start the race and watch the real-time results
5. Compare the performance metrics to see which chain is fastest

## Built With

- [Next.js 14](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Viem](https://viem.sh) - Ethereum library for transaction handling
- [Radix UI](https://www.radix-ui.com) - Accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com) - Utility-first styling
- [Next Themes](https://github.com/pacocoursey/next-themes) - Dark mode support