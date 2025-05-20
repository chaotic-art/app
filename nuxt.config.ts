// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },

  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 9090,
  },

  // Auto import components
  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['vue'],
        pathPrefix: false,
      },
    ],
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@wagmi/vue/nuxt',
  ],

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:9090',
      walletConnectProjectId:
        process.env.WALLET_CONNECT_PROJECT_ID
        || '4483dd2f5c3049479618d611e8a1087a',
    },
  },

  pinia: {
    storesDirs: ['./stores'],
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'en',
    restructureDir: './app/i18n',
  },

  ui: {
    // todo: dark mode
    colorMode: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-11-27',
})
