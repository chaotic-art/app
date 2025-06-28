<script setup lang="ts">
const props = defineProps<{
  currentExtension?: WalletExtension
}>()

const emit = defineEmits<{
  retry: [extension: WalletExtension]
}>()

const { $i18n } = useNuxtApp()

const isConnectionFailed = computed(() =>
  props.currentExtension?.state === WalletStates.ConnectionFailed,
)

const isConnectionQueued = computed(() =>
  props.currentExtension?.state === WalletStates.ConnectionQueued,
)

const isConnecting = computed(() =>
  props.currentExtension?.state === WalletStates.Connecting,
)

function handleRetry() {
  props.currentExtension && emit('retry', props.currentExtension)
}

const title = computed(() => {
  if (isConnectionFailed.value) {
    return $i18n.t('wallet.connectionFailed')
  }
  return $i18n.t('wallet.waitingForAuthorization')
})

const subtitle = computed(() => {
  if (isConnectionFailed.value) {
    return $i18n.t('wallet.connectionFailedDescription')
  }
  return $i18n.t('wallet.waitingForAuthorizationDescription')
})

const ringColors = computed(() => {
  if (isConnectionFailed.value) {
    return {
      primary: 'border-red-500',
      secondary: 'border-red-400',
    }
  }
  return {
    primary: 'border-blue-500',
    secondary: 'border-blue-400',
  }
})

const showRings = computed(() =>
  isConnectionQueued.value || isConnecting.value || isConnectionFailed.value,
)
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-6">
    <div class="relative">
      <template v-if="showRings">
        <div class="absolute inset-0 w-24 h-24 border-4 rounded-full pulse-ring" :class="ringColors.primary" />
        <div class="absolute inset-0 w-24 h-24 border-4 rounded-full pulse-ring-delayed" :class="ringColors.secondary" />
      </template>

      <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-white flex items-center justify-center relative z-10">
        <img
          :src="currentExtension?.icon"
          :alt="`${currentExtension?.name} Wallet Extension`"
          class="w-16 h-16 object-contain"
        >
      </div>
    </div>

    <div class="text-center space-y-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize">
        {{ title }}
      </h1>
      <h2 class="text-lg text-gray-600 dark:text-gray-300 font-medium">
        {{ subtitle }}
      </h2>

      <div v-if="isConnectionFailed" class="pt-2">
        <UButton
          :label="$t('wallet.retry')"
          variant="solid"
          class="text-white rounded-full px-6 text-base cursor-pointer"
          @click="handleRetry"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring-delayed {
  animation: pulse-ring 2s ease-out infinite;
  animation-delay: 0.7s;
}
</style>
