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
    class="rounded-full overflow-hidden bg-background border flex-shrink-0"
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
      title="User Avatar"
      class="object-cover rounded-full h-full w-full"
    >
  </div>
  <NativeAvatar
    v-else
    class="flex-shrink-0 bg-background"
    :size="size"
    :value="address"
  />
</template>
