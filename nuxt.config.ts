import { publicEnv } from './env.public'

export default defineNuxtConfig({
  devtools: { enabled: true },
  sourcemap: true,
  experimental: {
    appManifest: false,
  },
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 9090,
  },

  site: {
    name: 'Chaotic Labs',
    url: publicEnv.siteUrl,
    indexable: publicEnv.siteIndexable,
  },

  sitemap: {
    exclude: ['/settings', '/test-signer'],
  },

  seo: {
    meta: {
      title: 'Chaotic Labs',
      description: 'Your Polkadot NFT Marketplace',
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
      twitterCreator: '@chaoticlabs',
      twitterSite: '@chaoticlabs',
      author: 'Chaotic Labs',
      colorScheme: 'dark light',
      applicationName: 'Chaotic Labs',
    },
  },

  // Auto import components
  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['vue'],
        pathPrefix: false,
        // Avoid duplicate registrations; swap is handled by the entry below
        ignore: ['swap/**'],
      },
      {
        path: '~/components/swap',
        extensions: ['vue'],
        prefix: 'Swap',
        pathPrefix: true,
      },
    ],
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@wagmi/vue/nuxt',
    '@nuxtjs/seo',
    'nuxt-svgo',
  ],

  runtimeConfig: {
    // Keep private config empty in source and override via NUXT_* at runtime.
    falAiApiKey: '',
    public: publicEnv,
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'en',
    restructureDir: './app/i18n',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  css: ['~/assets/css/main.css'],

  icon: {
    serverBundle: {
      remote: 'jsdelivr',
    },
  },

  compatibilityDate: '2024-11-27',
})
