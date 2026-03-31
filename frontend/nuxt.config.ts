// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: 'Airsoft Racing - 氣槍競速賽',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '氣槍競速電競賽事報名平台' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3002/api',
    },
  },

  nitro: {
    serveStatic: true,
  },

  // Browser compatibility: support last 2 years of mainstream browsers
  vite: {
    build: {
      target: ['es2020', 'chrome90', 'edge90', 'firefox90', 'safari14'],
    },
  },
})
