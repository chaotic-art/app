<script setup lang="ts">
import { shortenAddress } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    address?: string
    avatarSize?: number
    noBackground?: boolean
    textCustomClass?: string
  }>(),
  {
    address: '',
    avatarSize: 40,
    noBackground: false,
    textCustomClass: '',
  },
)

const { profile: profileFromAddress } = useFetchProfile(
  computed(() => props.address),
)

const name = computed(() => profileFromAddress.value?.name || shortenAddress(props.address))
</script>

<template>
  <div class="flex items-center gap-2 mb-2 md:mb-0 rounded-full p-[6px] w-fit" :class="{ 'bg-transparent': noBackground }">
    <ProfileAvatar :address="address" :size="avatarSize" />
    <div>
      {{ name }}
    </div>
  </div>
</template>
