<script setup lang="ts">
import { shortenAddress } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    address?: string
    avatarSize?: number
    transparentBackground?: boolean
    customName?: boolean
  }>(),
  {
    address: '',
    avatarSize: 40,
    customName: false,
    transparentBackground: false,
  },
)

const { profile: profileFromAddress } = useFetchProfile(
  computed(() => props.address),
)

const name = computed(() => profileFromAddress.value?.name || shortenAddress(props.address))
</script>

<template>
  <div class="flex items-center gap-2 mb-2 md:mb-0 rounded-full p-[6px] w-fit bg-gray-100" :class="{ 'bg-transparent': transparentBackground }">
    <ProfileAvatar :address="address" :size="avatarSize" />
    <slot name="name" :address-name="name" />
    <span v-if="!customName">{{ name }}</span>
  </div>
</template>
