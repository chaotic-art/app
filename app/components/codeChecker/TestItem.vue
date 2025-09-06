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
      class: 'text-gray-500 animate-spin',
    }
  }
  if (props.passed === 'unknown' || (props.optional && !props.passed)) {
    return {
      name: 'i-heroicons-question-mark-circle',
      class: 'text-gray-500',
    }
  }

  return {
    name: props.passed ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle',
    class: props.passed ? 'text-green-500' : 'text-red-500',
  }
})
</script>

<template>
  <div class="flex justify-between">
    <div>
      <UIcon
        :name="icon.name"
        class="text-lg" :class="[icon.class]"
      />
      <span class="ml-5">{{ description }}</span>
    </div>
    <span
      v-if="props.passed === false"
      class="text-blue-500 cursor-pointer hover:text-blue-600"
      @click="showResolveIssuesModal = true"
    >
      {{ $t('codeChecker.resolveIssue') }}
    </span>

    <UModal
      v-model:open="showResolveIssuesModal"
      :title="$t('codeChecker.resolveIssue')"
    >
      <div class="max-w-[380px] px-6 pt-4 pb-5">
        <p class="text-base font-bold mb-4">
          {{ description }}
        </p>
        <slot name="modalContent" />
      </div>
    </UModal>
  </div>
</template>
