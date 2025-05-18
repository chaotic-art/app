<script setup lang="ts">
withDefaults(
  defineProps<{
    address?: string
    avatarSize?: number
  }>(),
  {
    address: '',
    avatarSize: 40,
  },
)

const name = ref('Artist Name')
</script>

<template>
  <div class="flex items-center gap-2 mb-2 md:mb-0 bg-gray-100 rounded-full p-[6px] w-fit">
    <img
      src="https://placehold.co/40x40/png"
      alt="Artist Avatar"
      class="rounded-full border"
      :style="{ width: `${avatarSize}px`, height: `${avatarSize}px` }"
    >
    <div class="">
      {{ name }}
    </div>
  </div>
</template>
