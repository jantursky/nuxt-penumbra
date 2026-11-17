export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['nuxt-penumbra'],
  penumbra: { themes: ['light', 'dark', 'sepia'], transition: 'circle', duration: 600 },
  app: { head: { title: 'nuxt-penumbra standalone playground' } },
  experimental: { viewTransition: true },
  devtools: { enabled: false },
})
