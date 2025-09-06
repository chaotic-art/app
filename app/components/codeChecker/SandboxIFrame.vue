<script setup lang="ts">
import type { AssetMessage } from './types'
import { useVModel } from '@vueuse/core'
import config from './codechecker.config'
import { postAssetsToSandbox } from './utils'

const props = withDefaults(
  defineProps<{
    hash: string
    assets: Array<AssetMessage>
    count: number
    customClass?: string | object
    iframeId?: string
  }>(),
  {
    iframeId: config.iframeId,
    customClass: '',
  },
)

const emit = defineEmits(['update:count'])

const vCount = useVModel(props, 'count', emit)

const iframeSrc = computed(() => `/sandbox.html?hash=${props.hash}`)

watch(
  () => props.assets,
  () => {
    // force update iframe
    vCount.value++
  },
  { deep: true },
)

function onIframeLoad() {
  postAssetsToSandbox(props.assets, props.iframeId)
}
</script>

<template>
  <iframe
    :id="iframeId"
    :key="count"
    :src="iframeSrc"
    class="sandbox-iframe" :class="[customClass]"
    sandbox="allow-scripts allow-same-origin"
    title="render-preview"
    allow="accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *;"
    @load="onIframeLoad"
  />
</template>

<style scoped>
.sandbox-iframe {
  width: 100%;
  height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>
