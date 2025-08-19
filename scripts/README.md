# Scripts

This directory contains utility scripts for the project.

## generate-providers.mjs

Automatically generates TypeScript provider configuration from `@polkadot/apps-config` endpoints.

### Usage

```bash
# Using npm/pnpm script
pnpm run generate:providers

# Or directly
node scripts/generate-providers.mjs
```

### What it does

- Extracts provider endpoints for all supported chains from `@polkadot/apps-config`
- Filters out light client providers that may not work in all environments
- Generates a TypeScript configuration file at `app/config/providers.ts`
- Provides utility functions for accessing providers

### Supported Chains

- **AHP** (Polkadot Asset Hub) - Production parachain
- **AHK** (Kusama Asset Hub) - Production parachain
- **DOT** (Polkadot) - Production relay chain
- **KSM** (Kusama) - Production relay chain
- **AHPAS** (Paseo Asset Hub) - Testnet parachain

The generated configuration is automatically used by the SDK client (`app/plugins/sdk.client.ts`) to provide multiple fallback endpoints for better reliability.
