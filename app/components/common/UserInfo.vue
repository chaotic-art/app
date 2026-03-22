<script setup lang="ts">
import { shortenAddress } from '@/utils/format/address'

const props = withDefaults(
  defineProps<{
    address?: string
    avatarSize?: number
    transparentBackground?: boolean
    customName?: boolean
    openProfileOnClick?: boolean
  }>(),
  {
    address: '',
    avatarSize: 40,
    customName: false,
    transparentBackground: false,
    openProfileOnClick: true,
  },
)

const { currentChain } = useChain()

const { profile: profileFromAddress } = useFetchProfile(
  computed(() => props.address),
)

const name = computed(() => profileFromAddress.value?.name || shortenAddress(props.address))

const linkComponent = computed(() => props.openProfileOnClick ? 'NuxtLink' : 'div')
const linkProps = computed(() => props.openProfileOnClick ? { to: `/${currentChain}/u/${props.address}` } : {})
</script>

<template>
  <component
    :is="linkComponent"
    v-bind="linkProps"
    class="flex items-center gap-2 rounded-full w-fit min-w-0 bg-secondary hover:bg-border"
    :class="{
      'bg-transparent!': transparentBackground,
      'px-2 py-1.5': !transparentBackground,
    }"
  >
    <ProfileAvatar :address="address" :size="avatarSize" />
    <slot name="name" :address-name="name" :description="profileFromAddress?.description" />
    <span v-if="!customName" class="text-ellipsis overflow-hidden whitespace-nowrap">{{ name }}</span>
  </component>
</template>
