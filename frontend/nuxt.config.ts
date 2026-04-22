// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      title: 'Airsoft Racing - 極限速度杯氣槍競速賽',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '極限速度杯 Airsoft Contest — 氣槍競速電競賽事報名平台。4v4 搶旗模式 Speedsoft，線上報名、即時查詢報名狀態。' },
        { name: 'theme-color', content: '#0f1923' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Airsoft Racing' },
        { property: 'og:locale', content: 'zh_TW' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@AirsoftRacing' },
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

  routeRules: {
    // HTML 頁面：每次都向伺服器驗證，避免 Safari/Chrome 快取舊版
    '/**': { headers: { 'cache-control': 'no-cache' } },
    // JS/CSS bundle 檔名帶 hash，可安全長快取
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  // Browser compatibility: support last 2 years of mainstream browsers
  vite: {
    build: {
      target: ['es2020', 'chrome90', 'edge90', 'firefox90', 'safari14'],
    },
  },
})
