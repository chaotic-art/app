<script lang="ts" setup>
import { toSvg } from 'jdenticon'

const props = withDefaults(
  defineProps<{
    value?: string
    size?: number
  }>(),
  {
    value: '',
    size: 64,
  },
)

const formattedAddress = computed(() => (props.value || '').toLowerCase())

const nativeAvatarSvg = computed(() =>
  toSvg(formattedAddress.value, props.size - 2, {
    padding: 0.1,
  }),
)
</script>

<template>
  <div
    class="border rounded-full overflow-hidden"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
    v-html="nativeAvatarSvg"
  />
</template>
