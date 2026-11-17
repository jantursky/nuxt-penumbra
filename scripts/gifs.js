// Records one GIF per transition from the demo, for the README. Run: bun run gifs
// Needs ffmpeg on the PATH and Playwright's Chromium. Builds and serves the demo itself.
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { chromium } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const out = join(root, '.github/assets/transitions')
const port = 4321
const size = { width: 960, height: 560 }
const duration = 900
const effects = [
  'circle',
  'circle-inverse',
  'fade',
  'wipe',
  'diamond',
  'iris',
  'blinds',
  'scan',
  'zoom',
  'slide',
  'split',
  'star',
  'blur-circle',
  'diagonal',
  'diagonal-soft',
  'square',
  'triangle',
  'sunburst',
  'cross',
  'heart',
  'ripple',
  'clock',
  'curtain',
  'stairs',
  'mosaic',
  'blur',
  'flip',
  'spin',
  'cover',
  'reveal',
]

execFileSync('bun', ['run', 'build:lib'], { cwd: root, stdio: 'inherit' })
execFileSync('bun', ['run', 'build'], { cwd: join(root, 'apps/demo'), stdio: 'inherit' })
const server = spawn('bunx', ['nuxt', 'preview', '--port', String(port)], {
  cwd: join(root, 'apps/demo'),
  stdio: 'ignore',
})
await new Promise((resolveWait) => setTimeout(resolveWait, 5000))

mkdirSync(out, { recursive: true })
const videos = mkdtempSync(join(tmpdir(), 'penumbra-gifs-'))
const browser = await chromium.launch()
try {
  for (const effect of effects) {
    const dir = join(videos, effect)
    const startedAt = Date.now()
    const context = await browser.newContext({
      viewport: size,
      recordVideo: { dir, size },
      colorScheme: 'light',
    })
    await context.addCookies([{ name: 'nuxt-color-mode', value: 'light', url: `http://localhost:${port}` }])
    const page = await context.newPage()
    await page.goto(`http://localhost:${port}/transitions`)
    await page.locator('label', { has: page.getByRole('radio', { name: effect, exact: true }) }).click()
    await page.getByLabel('Duration').fill(String(duration))
    await page.getByTestId('run').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const firstClick = Date.now() - startedAt
    await page.getByTestId('run').click()
    await page.waitForTimeout(duration + 900)
    await page.getByTestId('run').click()
    await page.waitForTimeout(duration + 500)
    await context.close()

    const [video] = readdirSync(dir)
    const start = Math.max(0, firstClick / 1000 - 0.4).toFixed(2)
    const seconds = ((duration * 2 + 2300) / 1000).toFixed(2)
    const palette = join(dir, 'palette.png')
    const input = ['-ss', start, '-t', seconds, '-i', join(dir, video)]
    const filters = 'fps=15,scale=640:-1:flags=lanczos'
    execFileSync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      ...input,
      '-vf',
      `${filters},palettegen=max_colors=64`,
      palette,
    ])
    const target = join(out, `${effect}.gif`)
    execFileSync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      ...input,
      '-i',
      palette,
      '-lavfi',
      `${filters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
      target,
    ])
    console.log(`${effect}.gif ${(statSync(target).size / 1024).toFixed(0)} kB`)
  }
} finally {
  await browser.close()
  server.kill()
  rmSync(videos, { recursive: true, force: true })
}
