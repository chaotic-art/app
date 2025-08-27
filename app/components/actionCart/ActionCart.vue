<script setup lang="ts">
import { useActionCartStore } from '@/stores/actionCart'

const { onDisconnect } = useWalletManager()
const actionCartStore = useActionCartStore()
const listingCartStore = useListingCartStore()
const preferencesStore = usePreferencesStore()
const router = useRouter()
const airdropStore = useAirdropStore()

const isListingDisabled = ref(false) // Allow listing for all chains for now

function transferToListingCart() {
  try {
    listingCartStore.clearListedItems()

    const items = actionCartStore.itemsInChain

    items.forEach((item) => {
      listingCartStore.setItem({
        ...item,
        collection: {
          ...item.collection,
          floor: undefined,
        },
      })
    })
  }
  catch { }
}

function onClickAirdrop() {
  actionCartStore.itemsInChain.forEach((item) => {
    airdropStore.setItem(item)
  })
  router.push('/airdrop')
}

onDisconnect(actionCartStore.clear)
onBeforeUnmount(actionCartStore.clear)
useModalIsOpenTracker({
  isOpen: computed(() => preferencesStore.listingCartModalOpen),
  onOpen: transferToListingCart,
})
</script>

<template>
  <transition name="slide">
    <div
      v-if="actionCartStore.count"
      class="fixed right-24 bottom-9 z-998"
    >
      <div class="inline-flex items-center">
        <div class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center p-2 gap-5 rounded-2xl">
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
            <UButton
              variant="outline"
              :disabled="actionCartStore.count <= 1"
              @click="onClickAirdrop"
            >
              Airdrop
              <UIcon
                name="i-lucide-gift"
              />
            </UButton>
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
