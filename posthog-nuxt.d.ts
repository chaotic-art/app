import type { ModuleOptions } from '@posthog/nuxt'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    posthogConfig?: ModuleOptions
  }

  interface NuxtOptions {
    posthogConfig?: ModuleOptions
  }
}

export {}
