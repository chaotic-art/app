<script setup lang="ts">
import { useActionCartStore } from '@/stores/actionCart'

const actionCartStore = useActionCartStore()
const preferencesStore = usePreferencesStore()
const { prefix } = usePrefix()

const listVisible = (prefix: string) => true // Allow listing for all chains for now

const isListingDisabled = computed(() => !listVisible(prefix.value))

onBeforeUnmount(actionCartStore.clear)
</script>

<template>
  <transition name="slide">
    <div
      v-if="actionCartStore.count"
      class="fixed right-24 bottom-9 z-998"
    >
      <div class="inline-flex items-center">
        <div class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center py-[0.875rem]! px-6 gap-8 rounded-2xl">
          <div class="inline-flex items-center">
            <div>
              <b>{{ actionCartStore.count }}</b>
              {{ $t('actionCart.item', actionCartStore.count) }}
            </div>
            <div class="mx-4" />
            <UButton
              :disabled="!actionCartStore.count"
              class="text-k-grey! hover:text-text-color! disabled:hover:text-k-grey!"
              variant="ghost"
              @click="actionCartStore.clear"
            >
              {{ $t('actionCart.clearAll') }}
            </UButton>
            <div class="mx-4 w-px h-4 bg-k-grey" />
            <UButton
              variant="ghost"
              class="text-k-grey! hover:text-text-color!"
              @click="actionCartStore.addAllToCart"
            >
              {{ $t('actionCart.selectAll') }}
            </UButton>
          </div>

          <div class="flex gap-4">
            <UTooltip
              class="cursor-pointer"
              :text="$t('toast.unsupportedOperation')"
              :prevent="!isListingDisabled"
            >
              <UButton
                variant="solid"
                color="primary"
                :disabled="isListingDisabled"
                @click="preferencesStore.listingCartModalOpen = true"
              >
                {{ $t('actionCart.listItem', actionCartStore.count) }}
              </UButton>
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
