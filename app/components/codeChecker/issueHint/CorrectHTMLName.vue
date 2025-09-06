<script setup lang="ts">
const code = `<!DOCTYPE html>
<html>
<head>
  <title>My Awesome Art</title>
  <!-- Other head elements -->
</head>
<body>
  <!-- Your content -->
</body>
</html>`
</script>

<template>
  <div>
    <p class="text-base mb-4">
      {{ $t('codeChecker.correctHTMLNameMeans') }}
    </p>
    <CodeBlock
      :code="code"
      lang="html"
    />
  </div>
</template>
