<script setup lang="ts">
const { prefix } = usePrefix()
const router = useRouter()

const navigationOptions = computed(() => [
  {
    label: 'Transfer',
    value: 'transfer',
    route: `/${prefix.value}/transfer`,
  },
  {
    label: 'Swap',
    value: 'swap',
    route: `/${prefix.value}/swap`,
  },
  {
    label: 'Settings',
    value: 'settings',
    route: '/settings',
  },
])
</script>

<template>
  <div class="w-full space-y-4">
    <div>
      <div
        v-for="(option, index) in navigationOptions"
        :key="option.value"
        class="flex flex-col"
      >
        <UButton
          :label="option.label"
          color="primary"
          variant="ghost"
          class="justify-between"
          size="xl"
          @click="router.push(option.route)"
        >
          <template #trailing>
            <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-primary-500 dark:text-primary-400" />
          </template>
        </UButton>

        <USeparator
          v-if="index < navigationOptions.length - 1"
          class="my-2"
        />
      </div>
    </div>

    <ThemeSwitcher show-label />
  </div>
</template>
