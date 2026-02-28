<script setup lang="ts">
const props = defineProps<{
  extraVariables?: Partial<Record<'owner' | 'issuer', string>>
}>()

defineEmits(['totalCountChange'])

const queryVariables = ref<Record<string, any>>({})

const { currentChain } = useChain()
</script>

<template>
  <div class="mt-4">
    <NftsToolbar
      :extra-variables="props.extraVariables"
      @update:query-variables="queryVariables = $event"
    />

    <div class="my-8">
      <NftsGrid
        :key="JSON.stringify(queryVariables)"
        :variables="queryVariables"
        :prefix="currentChain"
        @total-count-change="$emit('totalCountChange', $event)"
      />
    </div>
  </div>
</template>
