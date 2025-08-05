<script lang="ts" setup>
const props = withDefaults(
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

const { profile: profileFromAddress } = useFetchProfile(
  computed(() => props.profileImage ? undefined : props.address),
)

const profileImageUrl = computed(
  () => props.profileImage || profileFromAddress.value?.image,
)
</script>

<template>
  <div
    v-if="profileImageUrl"
    class="rounded-full overflow-hidden bg-white border aspect-square flex-shrink-0"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      padding: `${Math.round(size / 16)}px`,
    }"
  >
    <img
      :src="profileImageUrl"
      :sizes="`${size}px`"
      alt="User Avatar"
      class="object-cover rounded-full w-full h-full"
      style="object-position: center center;"
    >
  </div>
  <NativeAvatar
    v-else
    :size="size"
    :value="address"
  />
</template>
