// Installs the packed tarball into fresh projects, the way a consumer gets it from npm, then builds a Nuxt app
// with the module in both modes: with `@nuxtjs/color-mode` and standalone. Run after `bun run build:lib`.
// NUXT_VERSION picks one major (`3` or `4`); without it both are tested.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const packageDir = resolve(import.meta.dirname, '..')
const root = mkdtempSync(join(tmpdir(), 'nuxt-penumbra-pack-'))
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' })
const nuxtVersions = process.env.NUXT_VERSION ? [process.env.NUXT_VERSION] : ['3', '4']

const variants = [
  { name: 'color-mode', colorMode: true },
  { name: 'standalone', colorMode: false },
]

// The head script is the inline script that holds the storage key and follows `prefers-color-scheme`. The key alone
// is not enough to find it: it is also in the public runtime config that Nuxt serializes into the page.
const hasHeadScript = (html) =>
  [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].some(
    ([, code]) => code.includes('penumbra-theme') && code.includes('prefers-color-scheme'),
  )

function packModule() {
  const [packed] = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', root], packageDir))
  const files = packed.files.map((file) => file.path).sort()
  const allowed = /^(dist\/.+|README\.md|CHANGELOG\.md|LICENSE|package\.json)$/
  const unexpected = files.filter((file) => !allowed.test(file))
  if (unexpected.length > 0) throw new Error(`Unexpected files in the tarball: ${unexpected.join(', ')}`)
  console.log(`tarball: ${packed.filename}, ${files.length} files, ${(packed.size / 1024).toFixed(1)} kB`)
  return join(root, packed.filename)
}

function buildProject({ nuxt, variant, tarball }) {
  const name = `nuxt-${nuxt}-${variant.name}`
  const dir = join(root, name)
  const write = (path, content) => {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), content)
  }

  write('package.json', JSON.stringify({ name, private: true, type: 'module' }))
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      tarball,
      '@penumbra/core@^1.0.0',
      `nuxt@${nuxt}`,
      ...(variant.colorMode ? ['@nuxtjs/color-mode@latest'] : []),
    ],
    dir,
  )

  const modules = [...(variant.colorMode ? ['@nuxtjs/color-mode'] : []), 'nuxt-penumbra']
  // The page is prerendered, so the built HTML is what a visitor's browser receives first.
  write(
    'nuxt.config.ts',
    `export default defineNuxtConfig({
  modules: ${JSON.stringify(modules)},
  compatibilityDate: '2025-01-01',
  nitro: { prerender: { routes: ['/'] } },
})
`,
  )
  // Nuxt 4 reads the app from app/, Nuxt 3 from the project root.
  write(
    nuxt === '3' ? 'app.vue' : 'app/app.vue',
    `<script setup lang="ts">
const { theme, toggleTheme } = usePenumbra()
</script>

<template>
  <main>
    <p id="theme">{{ theme }}</p>
    <button id="toggle" @click="toggleTheme()">toggle</button>
    <PenumbraToggle />
  </main>
</template>
`,
  )

  run('npx', ['nuxt', 'build'], dir)

  const html = readFileSync(join(dir, '.output/public/index.html'), 'utf8')
  if (!html.includes('id="theme"')) throw new Error(`${name}: the page was not rendered`)
  if (!html.includes('penumbra-toggle')) throw new Error(`${name}: PenumbraToggle was not rendered`)
  if (variant.colorMode && hasHeadScript(html)) {
    throw new Error(`${name}: the standalone head script is in the page, but color-mode mode has its own`)
  }
  if (!variant.colorMode && !hasHeadScript(html)) {
    throw new Error(`${name}: the standalone head script is missing from the built page`)
  }
  const installed = JSON.parse(readFileSync(join(dir, 'node_modules/nuxt/package.json'), 'utf8')).version
  console.log(`built ${name} with nuxt ${installed}: ${variant.colorMode ? 'no head script' : 'head script inlined'}`)
}

try {
  const tarball = packModule()
  for (const nuxt of nuxtVersions) {
    for (const variant of variants) buildProject({ nuxt, variant, tarball })
  }
} finally {
  rmSync(root, { recursive: true, force: true })
}
