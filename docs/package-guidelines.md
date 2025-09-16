# Package Guidelines

## ⚠️ Restriction: No @kodadot1/static

**Temporary restriction** - Use internal implementations instead.

## Replacements

```typescript
// ❌ Avoid
import { getChainName, getPrefix, Prefix } from '@kodadot1/static'

// ✅ Use instead
import { useChain } from '~/composables/useChain'
import { SupportedChain } from '~/plugins/sdk.client'
import { chainSpec } from '~/utils/chain'

// Get chain info
const { chainName, ss58Format } = useChain()
// or
const chainName = chainSpec[currentChain].name
```

## Examples

### Component
```vue
<!-- Before -->
<script setup lang="ts">
import { getChainName, getPrefix, Prefix } from '@kodadot1/static'
</script>

<!-- After -->
<script setup lang="ts">
import { useChain } from '~/composables/useChain'

const prefix = ref<Prefix>('ahp')
const { chainName, ss58Format } = useChain()
</script>
```

### Types
```typescript
// Before
import { Prefix } from '@kodadot1/static'

// After
import { SupportedChain } from '~/plugins/sdk.client'

interface Config { prefix: Prefix }
interface Config { chain: SupportedChain }
```

## Resources
- `~/composables/useChain` - Route-based chain detection
- `~/composables/usePrefix` - Global prefix state
- `~/utils/chain` - Chain specifications
- `~/plugins/sdk.client` - SupportedChain type
