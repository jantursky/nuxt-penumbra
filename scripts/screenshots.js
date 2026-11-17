// Captures the demo for the README, in light and dark. Run: bun run screenshots
// Needs Playwright's Chromium. Builds and serves the demo itself.
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { chromium } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const out = join(root, '.github/assets')
const port = 4322
const views = [
  { name: 'dashboard', path: '/' },
  { name: 'transitions', path: '/transitions' },
]

execFileSync('bun', ['run', 'build:lib'], { cwd: root, stdio: 'inherit' })
execFileSync('bun', ['run', 'build'], { cwd: join(root, 'apps/demo'), stdio: 'inherit' })
const server = spawn('bunx', ['nuxt', 'preview', '--port', String(port)], {
  cwd: join(root, 'apps/demo'),
  stdio: 'ignore',
})
await new Promise((resolveWait) => setTimeout(resolveWait, 5000))

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
      colorScheme: scheme,
    })
    await context.addCookies([{ name: 'nuxt-color-mode', value: scheme, url: `http://localhost:${port}` }])
    for (const view of views) {
      const page = await context.newPage()
      await page.goto(`http://localhost:${port}${view.path}`)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(800)
      await page.screenshot({ path: join(out, `${view.name}-${scheme}.png`) })
      await page.close()
    }
    await context.close()
  }
} finally {
  await browser.close()
  server.kill()
}
