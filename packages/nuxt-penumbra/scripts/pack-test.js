// Installs the packed tarball into fresh projects, the way a consumer gets it from npm, then builds a Nuxt app
// with the module in both modes (with `@nuxtjs/color-mode` and standalone) and in each render mode (server, `ssr:
// false`, `nuxt generate`), then opens every build in Chromium and toggles the theme. Run after `bun run build:lib`.
// NUXT_VERSION picks one Nuxt version or major (`3`, `4`, `3.12`); without it `3` and `4` are tested.
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'

import { chromium } from 'playwright'

const packageDir = resolve(import.meta.dirname, '..')
const root = mkdtempSync(join(tmpdir(), 'nuxt-penumbra-pack-'))
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' })
const nuxtVersions = process.env.NUXT_VERSION ? [process.env.NUXT_VERSION] : ['3', '4']

// `render` is how the site is built and served: `ssr` runs the Node server, `spa` is `ssr: false`, `generate` is
// `nuxt generate`, both served as static files. `storage` is color-mode's storage.
const variants = [
  { name: 'color-mode', colorMode: true, render: 'ssr', storage: 'cookie' },
  { name: 'standalone', colorMode: false, render: 'ssr' },
  { name: 'color-mode-localstorage', colorMode: true, render: 'ssr', storage: 'localStorage' },
  { name: 'color-mode-spa', colorMode: true, render: 'spa', storage: 'cookie' },
  { name: 'standalone-spa', colorMode: false, render: 'spa' },
  { name: 'color-mode-generate', colorMode: true, render: 'generate', storage: 'cookie' },
  { name: 'standalone-generate', colorMode: false, render: 'generate' },
]

// The head script is the inline script that holds the storage key and follows `prefers-color-scheme`. The key alone
// is not enough to find it: it is also in the public runtime config that Nuxt serializes into the page.
const hasHeadScript = (html) =>
  [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].some(
    ([, code]) => code.includes('penumbra-theme') && code.includes('prefers-color-scheme'),
  )

function packModule() {
  const [packed] = JSON.parse(
    run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', root], packageDir),
  )
  const files = packed.files.map((file) => file.path).sort()
  const allowed = /^(dist\/.+|README\.md|CHANGELOG\.md|LICENSE|package\.json)$/
  const unexpected = files.filter((file) => !allowed.test(file))
  if (unexpected.length > 0) throw new Error(`Unexpected files in the tarball: ${unexpected.join(', ')}`)
  console.log(`tarball: ${packed.filename}, ${files.length} files, ${(packed.size / 1024).toFixed(1)} kB`)
  return join(root, packed.filename)
}

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
}

// Static files with a fallback to the shell page, as a static host serves a single-page app.
function serveStatic(dir) {
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const candidates = [join(dir, path), join(dir, path, 'index.html')]
    const file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
    const target = file ?? join(dir, 'index.html')
    response.setHeader('content-type', mime[extname(target)] ?? 'application/octet-stream')
    response.end(readFileSync(target))
  })
  return new Promise((done) => {
    server.listen(0, '127.0.0.1', () => {
      done({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() })
    })
  })
}

// The Node server Nitro builds. Waits for its "Listening" line.
function serveNode(dir) {
  const port = 20000 + Math.floor(Math.random() * 20000)
  const child = spawn('node', ['.output/server/index.mjs'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NITRO_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((done, fail) => {
    const timer = setTimeout(() => fail(new Error('the built server did not start')), 30_000)
    child.stdout.on('data', (chunk) => {
      if (!String(chunk).includes('Listening')) return
      clearTimeout(timer)
      done({ url: `http://127.0.0.1:${port}/`, close: () => child.kill() })
    })
    child.on('exit', (code) => fail(new Error(`the built server exited with code ${code}`)))
  })
}

// Opens the built site in Chromium and checks what a visitor sees. Throws on the first failed check.
async function checkInBrowser({ name, variant, url, browser }) {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`${name}: ${message}`)
  }
  const context = await browser.newContext()
  const page = await context.newPage()
  const problems = []
  page.on('pageerror', (error) => problems.push(error.message))
  page.on('console', (message) => {
    // A missing favicon is a 404 of the fixture, not of the module.
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) problems.push(message.text())
  })
  // Counts the view transitions the page starts, which is how an animated switch is told from an instant one.
  await page.addInitScript(() => {
    window.__transitions = 0
    const start = document.startViewTransition?.bind(document)
    if (start) {
      document.startViewTransition = (...args) => {
        window.__transitions++
        return start(...args)
      }
    }
  })
  // Standalone mode: the stored theme must be on <html> before the first paint, and must never be replaced.
  if (!variant.colorMode) {
    await page.addInitScript(() => {
      const seen = (window.__seen = [])
      new MutationObserver(() => seen.push(document.documentElement.getAttribute('data-theme'))).observe(document, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-theme'],
      })
      // Only the first visit is seeded, so a reload keeps what the visitor chose.
      if (localStorage.getItem('penumbra-theme') === null) localStorage.setItem('penumbra-theme', 'dark')
    })
  }

  await page.goto(url)
  await page.waitForSelector('#toggle')
  // Hydration has finished once the plugin's click handler is in place: the toggle changes the theme.
  const first = (await page.textContent('#theme')).trim()
  assert(['light', 'dark'].includes(first), `the theme shown is "${first}"`)
  if (!variant.colorMode) {
    assert(first === 'dark', `the stored theme was dark, the page shows "${first}"`)
    const seen = await page.evaluate(() => window.__seen)
    assert(
      !seen.includes('light') && !seen.includes(null),
      `<html> showed another theme before the stored one: ${seen}`,
    )
  }

  await page.click('#toggle')
  const expected = first === 'dark' ? 'light' : 'dark'
  await page.waitForFunction((theme) => document.querySelector('#theme').textContent.trim() === theme, expected)
  const animated = await page.evaluate(() => window.__transitions)
  assert(animated >= 1, 'the switch did not run a view transition')

  // Let the transition end, then reload: the choice must come back.
  await page.waitForTimeout(800)
  if (variant.colorMode) {
    const stored = await page.evaluate(() => ({
      local: localStorage.getItem('nuxt-color-mode'),
      cookie: document.cookie,
    }))
    const expectLocal = variant.storage === 'localStorage'
    assert(
      expectLocal ? stored.local === expected : stored.cookie.includes(`nuxt-color-mode=${expected}`),
      `color-mode did not store "${expected}": ${JSON.stringify(stored)}`,
    )
  } else {
    const stored = await page.evaluate(() => localStorage.getItem('penumbra-theme'))
    assert(stored === expected, `the choice "${expected}" was stored as "${stored}"`)
  }
  await page.reload()
  await page.waitForSelector('#toggle')
  await page.waitForFunction((theme) => document.querySelector('#theme').textContent.trim() === theme, expected)

  assert(problems.length === 0, `the page logged errors: ${problems.join(' | ')}`)
  await context.close()
}

function installProject({ nuxt, tarball }) {
  const name = `nuxt-${nuxt}`
  const dir = join(root, name)
  mkdirSync(dir, { recursive: true })
  // A fresh install of Nuxt 3.12 resolves an `unstorage` that 3.12's own renderer cannot run with (a bare Nuxt 3.12.4
  // project fails the same way, without this module), so the floor fixture pins the last one that works.
  const overrides = nuxt === '3.12' ? { unstorage: '1.15.0' } : undefined
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, private: true, type: 'module', overrides }))
  // Both modules are installed once; each variant lists the ones it uses in `modules`.
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      tarball,
      'penumbra-core@^1.0.0',
      `nuxt@${nuxt}`,
      '@nuxtjs/color-mode@latest',
    ],
    dir,
  )
  return dir
}

async function buildVariant({ nuxt, variant, dir, browser }) {
  const name = `nuxt-${nuxt}-${variant.name}`
  const write = (path, content) => {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  rmSync(join(dir, '.nuxt'), { recursive: true, force: true })
  rmSync(join(dir, '.output'), { recursive: true, force: true })

  const modules = [...(variant.colorMode ? ['@nuxtjs/color-mode'] : []), 'nuxt-penumbra']
  write(
    'nuxt.config.ts',
    `export default defineNuxtConfig({
  modules: ${JSON.stringify(modules)},
  compatibilityDate: '2025-01-01',
  ssr: ${variant.render !== 'spa'},
  ${variant.colorMode ? `colorMode: { storage: '${variant.storage}' },` : ''}
  nitro: { prerender: { routes: ['/'] } },
})
`,
  )
  // Nuxt 4 reads the app from app/, Nuxt 3 from the project root.
  write(
    nuxt.startsWith('3') ? 'app.vue' : 'app/app.vue',
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

  run('npx', ['nuxt', variant.render === 'generate' ? 'generate' : 'build'], dir)

  // A single-page app has no rendered markup to inspect; the browser check covers it.
  if (variant.render !== 'spa') {
    const html = readFileSync(join(dir, '.output/public/index.html'), 'utf8')
    if (!html.includes('id="theme"')) throw new Error(`${name}: the page was not rendered`)
    if (!html.includes('penumbra-toggle')) throw new Error(`${name}: PenumbraToggle was not rendered`)
    if (variant.colorMode && hasHeadScript(html)) {
      throw new Error(`${name}: the standalone head script is in the page, but color-mode mode has its own`)
    }
    if (!variant.colorMode && !hasHeadScript(html)) {
      throw new Error(`${name}: the standalone head script is missing from the built page`)
    }
  }

  const server = variant.render === 'ssr' ? await serveNode(dir) : await serveStatic(join(dir, '.output/public'))
  try {
    await checkInBrowser({ name, variant, url: server.url, browser })
  } finally {
    server.close()
  }
  const installed = JSON.parse(readFileSync(join(dir, 'node_modules/nuxt/package.json'), 'utf8')).version
  console.log(`ok ${name} (nuxt ${installed}): built, toggled in Chromium, choice kept after reload`)
}

const browser = await chromium.launch()
try {
  const tarball = packModule()
  for (const nuxt of nuxtVersions) {
    const dir = installProject({ nuxt, tarball })
    for (const variant of variants) await buildVariant({ nuxt, variant, dir, browser })
  }
} finally {
  await browser.close()
  rmSync(root, { recursive: true, force: true })
}
