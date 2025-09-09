<script setup lang="ts">
import CodeBlock from './CodeBlock.vue'

const code = `
  <!-- DON'T ❌ -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.min.js" />

  <!-- DO ✅-->
  <script src="./p5.min.js" />
  `
</script>

<template>
  <p class="text-base">
    {{ $t('codeChecker.notUsingExternalResourcesMeans') }}
  </p>
  <!--  -->
  <CodeBlock
    class="mt-5"
    :code="code"
    lang="html"
  />
</template>
