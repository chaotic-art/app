<script lang="ts" setup>
import { isEvmAddress } from 'dedot/utils'
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

const evmAvatarSvg = computed(() =>
  toSvg(formattedAddress.value, props.size - 2, {
    padding: 0.1,
  }),
)

const isEVMAddress = computed(
  () => props.value && isEvmAddress(props.value),
)
</script>

<template>
  <!-- EVM Address - Use jdenticon -->
  <div
    v-if="isEVMAddress"
    :class="WRAPPER_CLASS"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
    v-html="evmAvatarSvg"
  />

  <!-- Non-EVM Address - Use simple Iconify icon -->
  <div
    v-else
    :class="WRAPPER_CLASS"
    class="flex items-center justify-center"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <UIcon
      name="i-lucide-user"
      class="text-gray-500 dark:text-gray-400"
      :style="{
        width: `${size * 0.6}px`,
        height: `${size * 0.6}px`,
      }"
    />
  </div>
</template>
