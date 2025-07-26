<script setup lang="ts">
import { shortenAddress } from '@/utils/format/address'

interface Props {
  owner?: string
}

defineProps<Props>()
</script>

<template>
  <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-1 bg-gray-100 dark:bg-neutral-800 rounded-full">
          <UserInfo :avatar-size="40" :address="owner || undefined" />
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
            Owner
          </p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ owner ? shortenAddress(owner) : 'Unknown' }}
          </p>
        </div>
      </div>
      <FollowButton
        v-if="owner"
        :target="owner"
        class="rounded-full"
      />
    </div>
  </div>
</template>
