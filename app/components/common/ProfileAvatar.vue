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
    class="rounded-full overflow-hidden bg-background-color border"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      padding: `${Math.round(size / 16)}px`,
    }"
  >
    <NuxtImg
      :src="profileImageUrl"
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
