<script setup lang="ts">
const code = `function draw() {
  // Your drawing code here
  
  // Call postMessageKoda only once at the end
  postMessageKoda()
}`
</script>

<template>
  <div>
    <p class="text-base mb-4">
      {{ $t('codeChecker.kodaHashCalledOnceMeans') }}
    </p>
    <CodeBlock
      :code="code"
      lang="javascript"
    />
  </div>
</template>
