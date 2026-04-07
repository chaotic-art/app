import process from 'node:process'
import { publicEnv } from './env.public'

const posthogProjectId = process.env.POSTHOG_PROJECT_ID || ''
const posthogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY || ''
const posthogEnabled = Boolean(publicEnv.posthogPublicKey)
const posthogSourcemapsEnabled = process.env.NODE_ENV === 'production'
  && posthogEnabled
  && Boolean(posthogProjectId)
  && Boolean(posthogPersonalApiKey)

export default defineNuxtConfig({
  devtools: { enabled: true },
  sourcemap: {
    client: 'hidden',
  },
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
    name: 'Chaotic',
    url: publicEnv.siteUrl,
    indexable: publicEnv.siteIndexable,
  },

  sitemap: {
    exclude: ['/settings', '/test-signer'],
    sitemaps: {
      pages: {
        includeAppSources: true,
      },
      collections: {
        sources: ['/api/__sitemap__/collections'],
      },
      nfts: {
        sources: ['/api/__sitemap__/nfts'],
      },
      drops: {
        sources: ['/api/__sitemap__/drops'],
      },
    },
  },

  seo: {
    meta: {
      title: 'Chaotic | Polkadot NFT Marketplace for Generative Art',
      description: 'Create, collect, and sell Polkadot NFTs on Chaotic. Explore curated generative art drops and experimental AI collections.',
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
      twitterCreator: '@ChaoticApp',
      twitterSite: '@ChaoticApp',
      author: 'Chaotic',
      colorScheme: 'dark light',
      applicationName: 'Chaotic',
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
    ...(posthogEnabled ? ['@posthog/nuxt'] : []),
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

  nitro: {
    rollupConfig: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },

  posthogConfig: posthogEnabled
    ? {
        publicKey: publicEnv.posthogPublicKey,
        host: publicEnv.posthogHost,
        clientConfig: {
          capture_exceptions: true,
        },
        serverConfig: {
          enableExceptionAutocapture: true,
        },
        sourcemaps: posthogSourcemapsEnabled
          ? {
              enabled: true,
              projectId: posthogProjectId,
              personalApiKey: posthogPersonalApiKey,
            }
          : undefined,
      }
    : undefined,

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
