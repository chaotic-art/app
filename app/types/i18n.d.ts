import type { Ref } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $t: (key: string, params?: Record<string, any>) => string
    $i18n: {
      t: (key: string, params?: Record<string, any>) => string
      locale: Ref<string>
      locales: Array<{
        code: string
        name: string
        file?: string
      }>
      setLocale: (locale: string) => Promise<void>
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, params?: Record<string, any>) => string
    $i18n: {
      t: (key: string, params?: Record<string, any>) => string
      locale: Ref<string>
      locales: Array<{
        code: string
        name: string
        file?: string
      }>
      setLocale: (locale: string) => Promise<void>
    }
  }
}

export {}
