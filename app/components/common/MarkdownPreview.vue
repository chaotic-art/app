<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

defineProps<{
  source: string
}>()

const markdown: MarkdownIt = new MarkdownIt({
  breaks: true,
  linkify: true,
  highlight: (code: string, lang: string): string => {
    if (lang && Prism.languages[lang]) {
      return `<pre class="language-${lang}"><code>${Prism.highlight(
        code,
        Prism.languages[lang],
        lang,
      )}</code></pre>`
    }

    return `<pre class="language-none"><code>${markdown.utils.escapeHtml(
      code,
    )}</code></pre>`
  },
})
</script>

<template>
  <div
    v-dompurify-html="markdown.render(source)"
    class="[&_a]:!text-blue-500 [&_p]:mb-2.5"
  />
</template>
