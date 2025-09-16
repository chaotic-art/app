<script setup lang="ts">
import CodeBlock from './CodeBlock.vue'

const code = `
const params = getURLParams()
hash = params.hash || DEFAULT_HASH`
</script>

<template>
  <p class="text-base">
    {{ $t('codeChecker.usingParamHashMeans') }}
  </p>

  <CodeBlock
    class="mt-5"
    :code="code"
    lang="javascript"
  />
</template>
