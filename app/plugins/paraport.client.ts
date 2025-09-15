import { Paraport } from '@paraport/vue'
import '@paraport/vue/style'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Paraport', Paraport)
})
