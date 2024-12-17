// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  ssr: false,
  devtools: { enabled: true },
  compatibilityDate: '2024-12-01',

  icon: {
    customCollections: [
      {
        dir: './assets/icons',
        prefix: 'covermkr',
      },
    ],
  },

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          href: 'favicon.svg',
        },
      ],
    },
  },

  typescript: {
    typeCheck: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})