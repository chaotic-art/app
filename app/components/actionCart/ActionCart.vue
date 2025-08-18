<script setup lang="ts">
import { useActionCartStore } from '@/stores/actionCart'

const actionCartStore = useActionCartStore()
const preferencesStore = usePreferencesStore()

const isListingDisabled = ref(false) // Allow listing for all chains for now

onBeforeUnmount(actionCartStore.clear)
</script>

<template>
  <transition name="slide">
    <div
      v-if="actionCartStore.count"
      class="fixed right-24 bottom-9 z-998"
    >
      <div class="inline-flex items-center">
        <div class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center p-2 gap-8 rounded-2xl">
          <div class="flex items-center gap-2">
            <div class="px-4">
              <b>{{ actionCartStore.count }}</b>
              {{ $t('actionCart.item', { count: actionCartStore.count }) }}
            </div>

            <div class="flex items-center gap-2">
              <UButton
                :disabled="!actionCartStore.count"
                variant="ghost"
                @click="actionCartStore.clear"
              >
                {{ $t('actionCart.clearAll') }}
              </UButton>
              <UButton
                variant="ghost"
                @click="actionCartStore.addAllToCart"
              >
                {{ $t('actionCart.selectAll') }}
              </UButton>
            </div>
          </div>

          <div class="flex gap-4">
            <UTooltip
              class="cursor-pointer"
              text="Unsupported Operation"
              :open="isListingDisabled"
            >
              <UButton
                variant="solid"
                color="primary"
                :disabled="isListingDisabled"
                @click="preferencesStore.listingCartModalOpen = true"
              >
                {{ $t('actionCart.listItem', { count: actionCartStore.count }) }}
              </UButton>
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
