<script setup lang="ts">
const { shoppingCartModalOpen: isModalOpen } = storeToRefs(usePreferencesStore())
const shoppingCartStore = useShoppingCartStore()
const { itemsInChain: items, count } = storeToRefs(shoppingCartStore)
const { completePurchaseModal } = storeToRefs(usePreferencesStore())

const { decimals, chainSymbol } = useChain()

const { usd, formatted } = useAmount(
  computed(() => sum(items.value.map(item => Number(item.price)))),
  decimals,
  chainSymbol,
)

function completePurchase() {
  isModalOpen.value = false
  completePurchaseModal.value = { open: true, mode: 'shopping-cart' }
}
onBeforeUnmount(shoppingCartStore.clear)
</script>

<template>
  <div>
    <USlideover
      v-model:open="isModalOpen"
      title="Cart"
      side="right"
      :ui="{
        content: 'w-full md:max-w-[380px]',
      }"
    >
      <template #body>
        <EmptyShoppingCart v-if="count === 0" />

        <div v-else class="flex flex-col">
          <div class="mt-4 flex justify-between">
            <span>{{ count }} {{ $t('actionCart.item', { count }) }}</span>
            <UButton
              variant="ghost"
              :label="$t('actionCart.clearAll')"
              @click="shoppingCartStore.clear()"
            />
          </div>

          <USeparator class="my-2" />

          <div>
            <ShoppingCartItem v-for="item in items" :key="item.id" :item="item" class="py-2" />
          </div>

          <USeparator class="my-4" />

          <div class="flex justify-between">
            <span>{{ $t('general.total') }}</span>
            <div class="flex gap-4">
              <span class="text-gray-500 dark:text-gray-400">{{ formatted }}</span>
              <span class="font-bold">{{ usd }}</span>
            </div>
          </div>

          <UButton
            class="mt-4"
            size="lg"
            :label="$t('shoppingCart.completePurchase')"
            @click="completePurchase"
          />
        </div>
      </template>
    </USlideover>
  </div>
</template>
