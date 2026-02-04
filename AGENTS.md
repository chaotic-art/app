# AI Agent Guidelines

Instructions for AI agents working on **Chaotic.art** — a Polkadot NFT marketplace built with Nuxt 4, Vue 3, and TypeScript.

## Project Overview

- **Framework**: Nuxt 4 with Vue 3 Composition API (`<script setup>`)
- **Package Manager**: pnpm 10.x (see `pnpm-lock.yaml`)
- **Node**: v24.x
- **UI**: Nuxt UI v4 with custom components
- **State**: Pinia stores with persisted state
- **Data**: Apollo Client (GraphQL), TanStack Vue Query
- **Web3**: polkadot-api, Reown AppKit, Wagmi

## Code Style

### Vue Components

Always use Composition API with `<script setup lang="ts">`:

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  update: [value: string]
}>()
</script>

<template>
  <div>{{ title }}</div>
</template>
```

### TypeScript

- Use strict typing; avoid `any`
- Prefer type inference where clear
- Use `SupportedChain` type from `~/plugins/sdk.client` for chain identifiers

### Imports

- Use `~/` alias for app imports
- Auto-imports are enabled for Vue, Nuxt, and composables

## Key Conventions

### Chain Handling

Use `useChain` composable (route-based) as the primary method:

```typescript
// ✅ Preferred
import { useChain } from '~/composables/useChain'

// ⚠️ Fallback only
import usePrefix from '~/composables/usePrefix'

const { currentChain, chainName, ss58Format } = useChain()
const { prefix, setPrefix } = usePrefix()
```

### Package Restrictions

**Do NOT use** `@kodadot1/static` — use internal implementations instead:

```typescript
// ❌ Avoid
import { getChainName, Prefix } from '@kodadot1/static'

// ✅ Use instead
import { useChain } from '~/composables/useChain'
import { SupportedChain } from '~/plugins/sdk.client'
import { chainSpec } from '~/utils/chain'
```

## Directory Structure

```
app/
├── components/     # Vue components (auto-imported, no path prefix)
├── composables/    # Vue composables (useX naming)
├── pages/          # File-based routing with [chain] dynamic segment
├── stores/         # Pinia stores
├── services/       # API integrations (storage, AI, profiles)
├── utils/          # Pure utility functions
├── graphql/        # Apollo queries and client setup
├── plugins/        # Nuxt plugins (*.client.ts for client-only)
└── types/          # TypeScript type definitions
```

## Common Tasks

### Creating Components

- Place in `app/components/`
- Use PascalCase naming
- Components are auto-imported without prefix (except `swap/` → `SwapX`)

### Creating Composables

- Place in `app/composables/`
- Name with `use` prefix: `useFeatureName.ts`
- Return reactive refs/computed values

### Adding Pages

- Place in `app/pages/[chain]/` for chain-specific routes
- Use `.client.vue` suffix for client-only pages

### Working with Stores

- Pinia stores in `app/stores/`
- Use `defineStore` with setup syntax
- Persisted stores use `pinia-plugin-persistedstate`

## Development Commands

```bash
pnpm dev          # Dev server at localhost:9090
pnpm build        # Production build (runs papi first)
pnpm lint:fix     # Auto-fix lint issues
pnpm typecheck    # Type checking
```

## Testing Changes

- Run `pnpm lint` before committing
- Pre-commit hook runs linting via Husky
- Check TypeScript errors with `pnpm typecheck`

## Resources

- [Prefix Usage Guide](./docs/prefix-usage.md)
- [Package Guidelines](./docs/package-guidelines.md)
- [Figma Design System](https://www.figma.com/design/XTcZsQREdo9574lTzqkMDL/Chaotic)
