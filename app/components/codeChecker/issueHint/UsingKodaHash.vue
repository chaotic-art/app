<script setup lang="ts">
const code = `function postMessageKoda() {
  console.log('Talking')
  const canvas = document.querySelector('canvas')
  const message = {
    id: Date.now(),
    type: 'kodahash/render/completed',
    payload: {
      hash: hash,
      type: 'image/png',
      image: canvas ? canvas.toDataURL('image/png') : null,
      search: location.search,
      attributes: [],
    },
  }
  console.log('Sending', message)

  window.parent.postMessage(message, '*')
}`
</script>

<template>
  <div>
    <p class="text-base">
      {{ $t('codeChecker.usingKodaHashMeans') }}
      <a
        href="https://github.com/vikiival/kodahash"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-500 hover:text-blue-600"
      >
        {{ $t('codeChecker.kodahashTemplate') }}
      </a>
    </p>

    <CodeBlock
      class="mt-5"
      :code="code"
      lang="javascript"
    />
  </div>
</template>
