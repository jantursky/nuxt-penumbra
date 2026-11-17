import { readFileSync } from 'node:fs'

import { defineConfig } from 'blume'

const pkg = JSON.parse(readFileSync(new URL('../../packages/nuxt-penumbra/package.json', import.meta.url), 'utf8')) as {
  version: string
}

export default defineConfig({
  title: 'nuxt-penumbra',
  description: 'Animated theme switching for Nuxt, built on View Transitions.',
  logo: { image: { light: '/logo.svg', dark: '/icon-dark.svg', alt: '' } },
  github: {
    owner: 'jantursky',
    repo: 'nuxt-penumbra',
    dir: 'apps/docs',
  },
  navigation: {
    actions: [
      { href: 'https://www.npmjs.com/package/nuxt-penumbra', label: 'npm' },
      { href: 'https://github.com/jantursky/nuxt-penumbra', label: 'GitHub' },
    ],
  },
  deployment: { site: 'https://nuxt-penumbra-docs.vercel.app' },
  content: {
    root: 'docs',
  },
  // The values mirror --text and --accent in design/tokens.css (black in light mode, yellow in dark mode),
  // because the config cannot read CSS. theme.css maps the real tokens and paints filled accents yellow.
  theme: {
    accent: { light: '#000000', dark: '#ffd500' },
    radius: 'md',
    mode: 'system',
    fonts: {
      display: { name: 'Reddit Sans Condensed', weights: [900] },
      body: { name: 'Inter', weights: [400, 500, 600] },
    },
  },
  variables: {
    version: pkg.version,
  },
})
