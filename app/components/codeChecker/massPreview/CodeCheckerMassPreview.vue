<script setup lang="ts">
import type { AssetMessage } from '../types'
// import CodeCheckerMassPreviewCanvas from './Canvas.vue'
import CodeCheckerMassPreviewCapture from './Capture.vue'

defineProps<{
  assets: Array<AssetMessage>
  indexContent: string
}>()
defineEmits(['upload'])
</script>

<template>
  <div class="w-full max-w-[490px] flex flex-col gap-4">
    <!-- TODO: hidden until implement fully -->
    <!-- <CodeCheckerMassPreviewCanvas :assets="assets" /> -->
    <CodeCheckerMassPreviewCapture
      :assets="assets"
      :index-content="indexContent"
      @upload="(v: string) => $emit('upload', v)"
    />
  </div>
</template>
