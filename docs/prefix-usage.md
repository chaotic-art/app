# Prefix Usage Guide

## Priority Order

1. **`useChain`** - Get chain from route params (recommended)
2. **`usePrefix`** - Fallback for global state

## Usage

### Route-based (Primary)
```typescript
import { useChain } from '~/composables/useChain'

const { currentChain, chainName, ss58Format } = useChain()
// currentChain from route.params.chain, defaults to 'ahp'
```

### Global state (Fallback)
```typescript
import usePrefix from '~/composables/usePrefix'

const { prefix, setPrefix } = usePrefix()
// Manual chain switching
```

## Examples

### Vue Component
```vue
<script setup lang="ts">
import { useChain } from '~/composables/useChain'

const { currentChain, chainName, ss58Format } = useChain()
</script>

<template>
  <div>
    <h1>{{ chainName }}</h1>
    <p>Chain: {{ currentChain }}</p>
  </div>
</template>
```

### SDK Client
```typescript
import { $sdk } from '~/plugins/sdk.client'

const { currentChain } = useChain()
const { api, client } = $sdk(currentChain.value)
```

## Migration
```typescript
// ❌ Old
import { Prefix } from '@kodadot1/static'

// ✅ New
import { useChain } from '~/composables/useChain'
import { SupportedChain } from '~/plugins/sdk.client'
```
