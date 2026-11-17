export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // Nuxt UI installs @nuxtjs/color-mode itself and reads the `colorMode` options below. Its Tailwind CSS is loaded only
  // by the `ui` layout, see app/assets/css/ui.css.
  modules: ['@nuxt/ui', 'nuxt-penumbra'],
  css: ['~/assets/css/main.css'],
  colorMode: { classSuffix: '', storage: 'cookie', fallback: 'light' },
  penumbra: { transition: 'circle', duration: 600 },
  ui: { fonts: false },
  experimental: { viewTransition: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · nuxt-penumbra demo',
      meta: [
        {
          name: 'description',
          content: 'A small dashboard that switches theme with the View Transitions API, built with nuxt-penumbra.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  devtools: { enabled: false },
})
