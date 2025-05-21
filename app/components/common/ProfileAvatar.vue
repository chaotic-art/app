<script lang="ts" setup>
withDefaults(
  defineProps<{
    address?: string
    profileImage?: string
    size?: number
  }>(),
  {
    address: '',
    profileImage: undefined,
    size: 64,
  },
)
</script>

<template>
  <div
    v-if="profileImage"
    class="rounded-full overflow-hidden bg-background-color border"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      padding: `${Math.round(size / 16)}px`,
    }"
  >
    <NuxtImg
      :src="profileImage"
      :sizes="`${size}px`"
      title="User Avatar"
      class="object-cover overflow-hidden rounded-full h-full w-full shadow-none!"
      inner-class="object-cover"
    />
  </div>
  <NativeAvatar
    v-else
    :size="size"
    :value="address"
  />
</template>
