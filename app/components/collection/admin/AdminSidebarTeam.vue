<script setup lang="ts">
defineProps<{
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
      <span>Team</span>
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4"
      />
    </button>

    <div v-if="isExpanded" class="px-4 pb-4 space-y-3">
      <div v-if="ownerAddress" class="flex items-center gap-2">
        <UserInfo :address="ownerAddress" :avatar-size="24" />
        <UBadge label="OWNER" size="xs" color="primary" variant="subtle" />
      </div>

      <UButton
        variant="outline"
        size="sm"
        class="w-full"
        icon="i-heroicons-user-plus"
        @click="warningMessage('Team invitations coming soon')"
      >
        Invite
      </UButton>
    </div>
  </div>
</template>
