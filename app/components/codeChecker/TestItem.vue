<script setup lang="ts">
import type { Passed } from './types'

const props = defineProps<{
  passed: Passed
  description: string
  optional?: boolean
}>()

const showResolveIssuesModal = ref(false)

const icon = computed(() => {
  if (props.passed === 'loading') {
    return {
      name: 'i-heroicons-arrow-path',
      class: 'text-muted-foreground animate-spin',
    }
  }
  if (props.passed === 'unknown' || (props.optional && !props.passed)) {
    return {
      name: 'i-heroicons-question-mark-circle',
      class: 'text-muted-foreground',
    }
  }

  return {
    name: props.passed ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle',
    class: props.passed ? 'text-green-500' : 'text-destructive',
  }
})
</script>

<template>
  <div class="flex justify-between">
    <div class="flex items-center gap-2">
      <UIcon
        :name="icon.name"
        class="text-lg" :class="[icon.class]"
      />
      <span>{{ description }}</span>
    </div>
    <span
      v-if="props.passed === false"
      class="text-blue-400 cursor-pointer hover:text-primary/80"
      @click="showResolveIssuesModal = true"
    >
      {{ $t('codeChecker.resolveIssue') }}
    </span>

    <UModal
      v-model:open="showResolveIssuesModal"
      :title="$t('codeChecker.resolveIssue')"
    >
      <template #body>
        <div class="px-6 py-4">
          <p class="text-base font-bold mb-4">
            {{ description }}
          </p>
          <slot name="modalContent" />
        </div>
      </template>
    </UModal>
  </div>
</template>
