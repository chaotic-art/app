<script lang="ts" setup>
defineProps< {
  mobile?: boolean
}>()
const emit = defineEmits(['click'])

const { accountId } = useAuth()
const preferencesStore = usePreferencesStore()
const shoppingCartStore = useShoppingCartStore()

function handleClick() {
  preferencesStore.shoppingCartModalOpen = true
  emit('click')
}
</script>

<template>
  <UButton
    v-if="accountId"
    color="neutral"
    variant="ghost"
    :class="mobile ? 'w-full justify-start' : ''"
    @click="handleClick"
  >
    <div class="relative">
      <UIcon name="lucide:shopping-cart" class="w-5 h-5" />
      <span
        v-if="shoppingCartStore.count > 0"
        class="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center opacity-90"
      >
        {{ shoppingCartStore.count }}
      </span>
    </div>
    <span v-if="mobile" class="ml-2">Cart</span>
  </UButton>
</template>
