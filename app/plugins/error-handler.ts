/* eslint-disable no-console */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.log({ error, instance, info })
  }

  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.log({ error, instance, info })
  })
})
