<script setup lang="ts">
import CodeBlock from './CodeBlock.vue'

const code = `
function windowResized() {
  canvasSize = min(windowWidth, windowHeight)
  resizeCanvas(canvasSize, canvasSize)
}`
</script>

<template>
  <p class="text-base">
    {{ $t('codeChecker.automaticResizeMeans') }}
  </p>

  <CodeBlock
    class="mt-5"
    :code="code"
    lang="javascript"
  />
</template>
