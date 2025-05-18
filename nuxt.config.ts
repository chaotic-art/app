/* eslint-disable node/prefer-global/process */

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  pages: true,

  devServer: {
    port: 9090,
  },

  imports: {
    dirs: ['./app/utils'],
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@wagmi/vue/nuxt',
  ],

  runtimeConfig: {
    public: {
      walletConnectProjectId:
        process.env.WALLET_CONNECT_PROJECT_ID
        || '4483dd2f5c3049479618d611e8a1087a',
    },
  },

  pinia: {
    storesDirs: ['./app/stores'],
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-11-27',
})
