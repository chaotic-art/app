<script setup lang="ts">
const Tabs = {
  All: 'All',
  Polkadot: 'Polkadot',
  EVM: 'EVM',
}

const value = defineModel({ type: String })

const { t } = useI18n()

const tabItems = computed(() => [
  { label: t('wallet.all'), icon: 'i-lucide-wallet', value: Tabs.All },
  { label: t('wallet.polkadot'), icon: 'i-simple-icons-polkadot', value: Tabs.Polkadot },
  { label: t('wallet.evm'), icon: 'i-simple-icons-ethereum', value: Tabs.EVM },
])
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
        trigger: 'min-w-[100px] bg-secondary hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-200',
      }"
    />
  </div>
</template>
