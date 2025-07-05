<script lang="ts" setup>
defineProps<{
  target: string
}>()
const loading = ref(false)
</script>

<template>
  <ButtonConfig
    :loading="loading"
    :button="{
      label: $t('profile.follow'),
      icon: 'i-lucide-plus',
      classes: 'ml-4 px-6 py-2 rounded-full border border-gray-300 dark:border-neutral-700 bg-background-color-secondary text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-neutral-700',
    }"
    test-id="profile-button-multi-action"
  />
</template>
