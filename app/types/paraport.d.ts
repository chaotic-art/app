import type { Paraport } from '@paraport/vue'

declare module 'vue' {
  interface GlobalComponents {
    Paraport: typeof Paraport
  }
}

export {}
