<script setup lang="ts">
import { canInteract } from '@/utils/chain'

const { currentChain } = useChain()
const router = useRouter()

const canInteractOnChain = computed(() => canInteract(currentChain.value))

const navigationOptions = computed(() => [
  ...(canInteractOnChain.value
    ? [
        {
          label: 'Transfer',
          value: 'transfer',
          route: `/${currentChain.value}/transfer`,
        },
        {
          label: 'Swap',
          value: 'swap',
          route: `/${currentChain.value}/swap`,
        },
      ]
    : []),
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
