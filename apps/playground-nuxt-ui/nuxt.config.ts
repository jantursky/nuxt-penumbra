export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // Nuxt UI registers @nuxtjs/color-mode itself, with `disableTransition: true`.
  modules: ['@nuxt/ui', 'nuxt-penumbra'],
  css: ['~/assets/main.css'],
  penumbra: { transition: 'circle', duration: 600 },
  app: { head: { title: 'nuxt-penumbra with Nuxt UI', htmlAttrs: { lang: 'en' } } },
  experimental: { viewTransition: true },
  devtools: { enabled: false },
})
