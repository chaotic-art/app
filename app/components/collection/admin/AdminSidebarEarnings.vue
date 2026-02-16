<script setup lang="ts">
defineProps<{
  royaltyPercentage?: number
  ownerAddress?: string
}>()

const isExpanded = ref(false)
</script>

<template>
  <div class="border-b border-border">
    <button
      class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <span>Earnings</span>
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4"
      />
    </button>

    <div v-if="isExpanded" class="px-4 pb-4 space-y-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Royalty</span>
        <span class="font-medium">{{ royaltyPercentage ?? 0 }}%</span>
      </div>

      <div v-if="ownerAddress">
        <label class="text-xs text-muted-foreground block mb-1">Recipient</label>
        <div class="flex items-center gap-2">
          <UserInfo :address="ownerAddress" :avatar-size="20" class="text-xs" />
        </div>
      </div>

      <p v-if="!ownerAddress" class="text-xs text-muted-foreground">
        No royalty configured
      </p>
    </div>
  </div>
</template>
