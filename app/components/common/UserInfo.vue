<script setup lang="ts">
import { shortenAddress } from '@/utils/format/address'

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

const { currentChain } = useChain()

const { profile: profileFromAddress } = useFetchProfile(
  computed(() => props.address),
)

const name = computed(() => profileFromAddress.value?.name || shortenAddress(props.address))
</script>

<template>
  <NuxtLink :to="`/${currentChain}/u/${address}`" class="flex items-center gap-2 rounded-full w-fit min-w-0 bg-secondary hover:bg-ring" :class="{ '!bg-transparent': transparentBackground, 'p-1.5': !transparentBackground }">
    <ProfileAvatar :address="address" :size="avatarSize" />
    <slot name="name" :address-name="name" :description="profileFromAddress?.description" />
    <span v-if="!customName" class="text-ellipsis overflow-hidden whitespace-nowrap">{{ name }}</span>
  </NuxtLink>
</template>
