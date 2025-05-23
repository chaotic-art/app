<script lang="ts" setup>
import { polkadotIcon } from '@polkadot/ui-shared'
import { isEthereumAddress } from '@polkadot/util-crypto'
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

const formattedAddress = computed(() => props.value.toLowerCase())

const evmAvatarSvg = computed(() =>
  toSvg(formattedAddress.value, props.size - 2, {
    padding: 0.1,
  }),
)

const isEVMAddress = computed(
  () => props.value && isEthereumAddress(props.value),
)
</script>

<template>
  <div
    v-if="isEVMAddress"
    v-dompurify-html:svg="evmAvatarSvg"
    :class="WRAPPER_CLASS"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  />
  <div v-else>
    <svg :width="size" :height="size" viewBox="0 0 64 64" :class="WRAPPER_CLASS">
      <circle v-for="(icon, index) in polkadotIcon(value, { isAlternative: false })" :key="index" :cx="icon.cx" :cy="icon.cy" :r="icon.r" :fill="icon.fill" />
    </svg>
  </div>
</template>
