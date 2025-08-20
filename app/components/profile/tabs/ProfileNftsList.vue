<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  extraVariables?: Partial<Record<'owner' | 'issuer', string>>
}>()

defineEmits(['totalCountChange'])

const queryVariables = ref<Record<string, any>>({})

const { chain } = useRoute().params as { chain: AssetHubChain }
const currentChain = computed(() => chain || 'ahp')
</script>

<template>
  <div>
    <NftsToolbar
      :extra-variables="props.extraVariables"
      @update:query-variables="queryVariables = $event"
    />

    <div class="my-8">
      <NftsGrid
        :key="JSON.stringify(queryVariables)"
        :search="queryVariables.name || ''"
        :owner="queryVariables.owner"
        :issuer="queryVariables.issuer"
        :variables="queryVariables"
        :prefix="currentChain"
        @total-count-change="$emit('totalCountChange', $event)"
      />
    </div>
  </div>
</template>
