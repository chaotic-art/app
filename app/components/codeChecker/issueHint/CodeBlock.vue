<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import Prism from 'prismjs'
// @ts-expect-error - This is a valid import
import NormalizeWhitespace from 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace'
import 'prismjs/themes/prism-tomorrow.css'

const props = defineProps<{ code: string, lang: string }>()
const { $i18n } = useNuxtApp()
const { copy } = useClipboard()

const nw = new NormalizeWhitespace({
  'remove-trailing': true,
  'right-trim': true,
})

const normalizedCode = computed(() => nw.normalize(props.code))
const highlightedCode = computed(() => {
  const html = Prism.highlight(
    normalizedCode.value,
    (Prism.languages[props.lang] || Prism.languages.javascript) as Prism.Grammar,
    props.lang,
  )

  // prevent Bulma's global styles from overriding styling of elements with `.tag` class
  return html.replaceAll(
    'class="token operator"',
    'class="token text-red-800 dark:text-rose-400"',
  )
})

function handleCopy() {
  copy(normalizedCode.value)
  successMessage($i18n.t('general.copyToClipboard'))
}
</script>

<template>
  <div>
    <pre
      class="resolve-issue-code-example border border-border-color pb-[30px]! my-0! rounded-t-xl! rounded-b-none! bg-neutral-2! dark:bg-neutral-8!"
      :class="`language-${lang}`"
      v-html="highlightedCode"
    />

    <div
      v-clipboard:copy="normalizedCode"
      class="bottom-0 w-full text-right border border-t-0 rounded-b-xl py-1.5 px-3.5 text-xs cursor-pointer bg-neutral-2 hover:bg-neutral-4 dark:bg-neutral-10 dark:hover:bg-neutral-8"
      @click="handleCopy"
    >
      Copy Code
    </div>
  </div>
</template>
