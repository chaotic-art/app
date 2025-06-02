import VueDOMPurifyHTML from 'vue-dompurify-html'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDOMPurifyHTML, {
    default: {
      ALLOWED_TAGS: [
        'a',
        'strong',
        'p',
        'em',
        'ul',
        'ol',
        'li',
        'br',
        'hr',
        'img',
        'pre',
        'code',
        'span',
      ],
      ALLOWED_ATTR: ['href', 'target', 'class'],
    },
    namedConfigurations: {
      svg: {
        USE_PROFILES: { svg: true },
      },
    },
  })
})
