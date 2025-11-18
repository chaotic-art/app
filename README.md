# Chaotic.art · Your Polkadot NFT Marketplace (Beta)

[chaotic.art](https://chaotic.art) · [Design system](https://www.figma.com/design/XTcZsQREdo9574lTzqkMDL/Chaotic)

![](https://github.com/user-attachments/assets/b2777451-c789-470e-bf9e-45445455204e)

## Table of Contents
- [Live Product](#live-product)
- [Product Highlights](#product-highlights)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Tour](#repository-tour)
- [Getting Started](#getting-started)
- [Project Scripts](#project-scripts)

### Features of Chaotic
- Home for your Polkadot NFTs
- Live mint for generative art drops with a curated set of artists
- Experimental AI NFT collections such as Chaotic Cards
- Seamless on-chain experience with mobile-first design

## Product Highlights
- **Polkadot native onboarding** – Wallet connectivity (Substrate and EVM) with fallback logic for unsupported chains.
- **Creator tooling** – NFT and collection creation flows provide media uploads, fee estimation, and on-chain submission through the Polkadot API SDK.
- **Generative storytelling** – Chaotic Cards integrate AI, producing narrative metadata for social drops.
- **Content delivery pipeline** – Assets resolve through IPFS, Arweave, and Cloudflare Image Delivery with automatic provider selection based on environment.
- **Realtime market data** – Apollo GraphQL client queries Subsquid endpoints for collection stats, while Pinia stores keep UI state in sync.

## Tech Stack
- **Framework**: Nuxt 4 (Vue 3, Nitro, Vite) with Nuxt UI components
- **State and data**: Pinia (with persisted state), TanStack Vue Query, Apollo Client
- **Web3**: polkadot-api typed descriptors, Reown AppKit + Wagmi for wallet connections
- **AI and media**: Cloudflare Images, IPFS/Arweave gateways, FAL.ai generative edits
- **Tooling**: pnpm, TypeScript, ESLint, `papi` whitelist enforcement for chain RPCs

## Architecture Overview
- **Frontend composition**: Nuxt components, layouts, and route-driven hydration. Landing flows use lazy components to keep first paint light.
- **Data layer**:  typed Polkadot clients against generated provider lists; GraphQL queries introspection from Subsquid.
- **Services**: contains integrations for card minting, AI generation, storage, and profile metadata.
- **State management**: Pinia stores are used to manage wallets, carts, drops, and preferences with persisted client storage where safe.

## Repository Tour
- `app/` – Source of truth for components, pages, stores, composables, services, and typed assets
- `public/` – Static assets served as-is, including marketing imagery and icons
- `.papi/` – Polkadot API metadata, descriptors, and whitelist configuration consumed during builds
- `docs/` – Internal developer guides (package usage and prefix conventions)
- `scripts/` – Utility scripts such as provider generation for RPC endpoints

## Getting Started

### Prerequisites
- Node.js 20.x (Nuxt 4 target) and pnpm 9+

### Installation
```bash
pnpm install
```

### Development server
```bash
pnpm run dev
```
- Available at `http://localhost:9090`
- Nuxt devtools enabled by default (`devtools.enabled = true`)

### Production build and preview
```bash
pnpm run build
pnpm run preview
```
- Build triggers `papi` whitelist validation before Nuxt compilation

## Project Scripts
- `pnpm run dev` – Nuxt development server with hot reload
- `pnpm run build` – Validate Polkadot API whitelist (`papi`) and produce production build
- `pnpm run preview` – Serve the production build locally
- `pnpm run generate` – Generate route payloads for static hosting
- `pnpm run generate:providers` – Refresh `app/config/providers.ts` from `@polkadot/apps-config`
- `pnpm run lint` / `pnpm run lint:fix` – ESLint in check or autofix mode
- `pnpm run typecheck` – Nuxt type checker gated by `papi`
