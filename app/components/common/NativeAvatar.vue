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

const WRAPPER_CLASS = 'border border-border-color rounded-full overflow-hidden bg-background-color'

const formattedAddress = computed(() => (props.value || '').toLowerCase())

const nativeAvatarSvg = computed(() =>
  toSvg(formattedAddress.value, props.size - 2, {
    padding: 0.1,
  }),
)
</script>

<template>
  <div
    :class="WRAPPER_CLASS"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
    v-html="nativeAvatarSvg"
  />
</template>
