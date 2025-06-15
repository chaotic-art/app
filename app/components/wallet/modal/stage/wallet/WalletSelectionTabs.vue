<script setup lang="ts">
const Tabs = {
  All: 'All',
  Polkadot: 'Polkadot',
  EVM: 'EVM',
}

const value = defineModel()

const tabItems = [
  { label: 'All', icon: 'i-lucide-wallet', value: Tabs.All },
  { label: 'Polkadot', icon: 'i-simple-icons-polkadot', value: Tabs.Polkadot },
  { label: 'EVM', icon: 'i-simple-icons-ethereum', value: Tabs.EVM },
]
</script>

<template>
  <div class="flex justify-start">
    <UTabs
      v-model="value"
      :items="tabItems"
      :content="false"
      variant="pill"
      color="primary"
      size="sm"
      class="w-fit"
      :ui="{
        list: 'bg-transparent gap-2',
        indicator: 'hidden',
        trigger: 'min-w-[100px] bg-gray-100 dark:bg-gray-800 data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200',
      }"
    />
  </div>
</template>
