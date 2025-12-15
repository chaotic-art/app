<script lang="ts" setup>
defineProps<{
  creator?: string
  counterparty: string
  isCollectionSwap?: boolean
}>()
</script>

<template>
  <div class="flex gap-4">
    <div class="flex flex-col gap-4 justify-start items-center">
      <div class="font-bold text-xl capitalize">
        {{ $t('swap.yourAddress') }}
      </div>

      <ProfilePill v-if="creator" :address="creator" />
      <ConnectWallet v-else />
    </div>
    <div class="flex items-center">
      <UIcon
        class="text-4xl"
        name="i-mdi:swap-horizontal"
        size="xl"
      />
    </div>
    <div class="flex flex-col gap-4 justify-start items-center">
      <div class="font-bold text-xl capitalize">
        {{ $t('swap.counterparty') }}
      </div>
      <SwapBannerCollectionPreview
        v-if="isCollectionSwap"
        :collection-id="counterparty"
      />
      <ProfilePill v-else :address="counterparty" />
    </div>
  </div>
</template>
