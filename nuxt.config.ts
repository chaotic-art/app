import { createLogger } from 'vite'

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
    indexable: false,
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
    '@nuxtjs/seo',
    'nuxt-svgo',
    '@nuxtjs/supabase',
  ],

  supabase: {
    redirectOptions: {
      login: '/twitter-auth', // change with card page
      callback: '/confirm',
    },
  },

  runtimeConfig: {
    public: {
      reownProjectId: import.meta.env.REOWN_CONNECT_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694',
    },
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
    bundle: {
      optimizeTranslationDirective: false,
    },
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

  hooks: {
    'vite:extendConfig': function (viteConfig) {
      const logger = createLogger(viteConfig.logLevel)
      const originalWarning = logger.warn

      logger.warn = (msg, options) => {
        const isPureCommentWarning = msg.includes('PURE')

        if (isPureCommentWarning)
          return

        originalWarning(msg, options)
      }

      viteConfig.customLogger = logger
    },
  },
})
