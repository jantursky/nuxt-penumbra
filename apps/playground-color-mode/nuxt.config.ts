export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@nuxtjs/color-mode', 'nuxt-penumbra'],
  colorMode: { classSuffix: '', storage: 'cookie', fallback: 'light' },
  penumbra: { transition: 'circle', duration: 600 },
  app: { head: { title: 'nuxt-penumbra playground', htmlAttrs: { lang: 'en' } } },
  experimental: { viewTransition: true },
  devtools: { enabled: false },
})
