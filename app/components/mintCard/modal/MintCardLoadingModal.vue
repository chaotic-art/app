<script setup lang="ts">
const open = defineModel<boolean>('open')
</script>

<template>
  <UModal
    v-model:open="open"
    title="Minting Card"
    :dismissible="!open"
    :close="false"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="h-[200px]">
        <SkeletonLoader
          title="Processing"
          subtitle="Please wait for about 1 minute . . ."
          solid
        />
      </div>
    </template>
  </UModal>
</template>
