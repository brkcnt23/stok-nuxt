// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    'nuxt-mongoose',
    'nuxt-tiptap-editor',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
    '@hypernym/nuxt-anime',
    '@vueuse/motion/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  // New site configuration block
  site: {
    url: process.env.NUXT_SITE_URL || 'https://asma-germe.com',
    name: 'asmagerme',
    env: process.env.NUXT_SITE_ENV || 'production'
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    rootId: '__up',
    rootTag: 'upcreate'
  },


  gtag: {
    id: 'G-S96V1WQ0XM'
  },
  // colorMode: {
  //  preference: 'light'
  // },

  css: [
    '~/assets/css/main.css',
    '@photo-sphere-viewer/core/index.css'
  ],

  routeRules: {
    '/': { prerender: true }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  // Updated sitemap configuration based on documentation
  sitemap: {
    // No longer need siteUrl here as it uses site.url
    sources: [
      '/api/__sitemap__/blogs',
      '/api/__sitemap__/projects'
    ],

    // Static URLs that don't change frequently
    urls: [
      '/',
      '/about',
      '/hakkimizda',
      '/projeler',
      '/urunler',
      '/contact',
      '/iletisim',
      '/services'
    ],

    // Default properties for all URLs
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date()
    },

    // Cache settings - short cache in development, longer in production
    cacheMaxAgeSeconds: process.env.NODE_ENV === 'development' ? 0 : 1800, // 0 for dev, 30 minutes for prod

    // Optional: Disable XML stylesheet
    xsl: false
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    baseUrl: 'https://asma-germe.com',
    experimental: {
      localeDetector: './localeDetector.ts'
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    bundle: {
      optimizeTranslationDirective: false
    },
    locales: [
      { code: 'tr', language: 'tr-TR', name: 'Türkçe' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'tr',
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts'
  },

})