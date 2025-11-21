<script lang="ts" setup>
const { walletConnectModalOpen } = storeToRefs(usePreferencesStore())
</script>

<template>
  <UButton
    :label="$t('general.connectWallet')"
    @click="walletConnectModalOpen = true"
  />
</template>
