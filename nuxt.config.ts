import { createLogger } from 'vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
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
  ],

  runtimeConfig: {
    public: {
      baseUrl: import.meta.env.BASE_URL || 'http://localhost:9090',
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

  compatibilityDate: '2024-11-27',

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // if (id.includes('reown'))
            //   return 'reown'
            // if (id.includes('@reown/appkit-controllers'))
            //   return '@reown/appkit-controllers'
            // if (id.includes('@reown/appkit-ui'))
            //   return '@reown/appkit-ui'
            // if (id.includes('@reown/appkit-wallet'))
            //   return '@reown/appkit-wallet'
            // if (id.includes('@reown/appkit-adapter-wagmi'))
            //   return '@reown/appkit-adapter-wagmi'

            if (id.includes('@apollo/client'))
              return '@apollo/client'
            // if (id.includes('viem'))
            //   return 'viem'
            if (id.includes('zod'))
              return 'zod'
            // if (id.includes('rxjs'))
            //   return 'rxjs'
            if (id.includes('reka-ui'))
              return 'reka-ui'
            if (id.includes('@tanstack/query-core'))
              return '@tanstack/query-core'
          },
        },
      },
    },
  },

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
