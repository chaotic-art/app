<script setup lang="ts">
defineProps<{
  imageUrl?: string
  name?: string
  id?: string
}>()

const open = defineModel<boolean>('open')
const currentUrl = computed(() => window.location.href)
</script>

<template>
  <UModal
    v-model:open="open"
    title="Success"
    :dismissible="!open"
    :close="true"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="flex flex-col items-center">
        <img
          class="border rounded-xl border-gray-200 dark:border-gray-700 w-[200px] h-[200px]"
          :src="imageUrl"
        >

        <p class="text-base capitalize font-bold text-center mt-5">
          {{ name }}
        </p>

        <USeparator class="my-5" />

        <ShareSocialsSection
          class="!my-0"
          :text="$t('card.mintSuccess', [id])"
          :url="currentUrl"
          with-copy
        />
      </div>
    </template>
  </UModal>
</template>
