<script setup lang="ts">
import { useElementHover } from '@vueuse/core'
import { useTemplateRef } from 'vue'

defineProps<{
  item: ShoppingCartItem
}>()

const shoppingCartStore = useShoppingCartStore()

const cart = useTemplateRef<HTMLButtonElement>('cart')
const isHovered = useElementHover(cart)
</script>

<template>
  <div ref="cart" class="transition-colors hover:bg-muted/20 duration-150">
    <CartItemDetails
      :name="item.name"
      :image="item.metadata?.image"
      collection-name="'Unknown Collection'"
      :price="item.price"
    >
      <template v-if="isHovered" #right>
        <div class="inline-flex items-center">
          <UButton
            icon="material-symbols:delete"
            variant="ghost"
            @click="shoppingCartStore.removeItem(item.id)"
          />
        </div>
      </template>
    </CartItemDetails>
  </div>
</template>
