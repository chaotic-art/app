<script setup lang="ts">
defineProps<{
  items: WalletExtensionAccountPair[]
}>()

const emit = defineEmits<{
  select: [accountId: string]
}>()

function handleAccountSelect(accountId: string) {
  emit('select', accountId)
}
</script>

<template>
  <div>
    <WalletAccountListEmpty v-if="items.length === 0" />

    <div class="flex flex-col gap-2 p-1">
      <WalletAccountListItem
        v-for="({ account, extension }) in items"
        :key="account.id"
        :account="account"
        :extension="extension"
        @select="handleAccountSelect"
      />
    </div>
  </div>
</template>
