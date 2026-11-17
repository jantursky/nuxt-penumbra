import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('PenumbraToggle is a button that names the current and the next theme', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByTestId('penumbra-toggle')
  expect(await toggle.evaluate((el) => el.tagName)).toBe('BUTTON')
  await expect(toggle).toHaveAttribute('aria-label', 'Theme: light. Switch to dark.')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(toggle).toHaveAttribute('aria-label', 'Theme: dark. Switch to light.')
  await page.keyboard.press('Space')
  await expect(page.getByTestId('theme')).toHaveText('light')
})

test('nothing is announced when the theme changes', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0)
})

test('rapid double toggles end on a consistent state', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByTestId('toggle')
  await toggle.click()
  await toggle.click()
  await toggle.click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByTestId('preference')).toHaveText('dark')
  await page.waitForTimeout(900)
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0)
  await toggle.click()
  await toggle.click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('reduced motion switches instantly', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(() => {
    const w = window as unknown as { __vt: number }
    w.__vt = 0
    const original = document.startViewTransition.bind(document)
    document.startViewTransition = ((cb?: () => Promise<void> | void) => {
      w.__vt++
      return original(cb)
    }) as typeof document.startViewTransition
  })
  await page.getByTestId('toggle').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(0)
})

test('falls back to an instant switch without the View Transitions API', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByTestId('toggle').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(errors).toEqual([])
})

test('a theme change during a page navigation does not break either', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox')
  await page.goto('/')
  await page.getByRole('link', { name: 'About' }).click()
  await page.getByTestId('toggle').click()
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('link', { name: 'Home' }).click()
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('with cookie storage the server knows the choice and the stored theme is on <html> before first paint', async ({
  page,
  context,
  baseURL,
}) => {
  const response = await page.request.get('/', { headers: { cookie: 'nuxt-color-mode=dark' } })
  expect(await response.text()).toContain('data-testid="preference">dark<')
  await context.addCookies([{ name: 'nuxt-color-mode', value: 'dark', url: baseURL! }])
  await page.addInitScript(() => {
    const seen: string[] = []
    ;(window as unknown as { __seen: string[] }).__seen = seen
    new MutationObserver(() => {
      seen.push(document.documentElement.className)
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['class'] })
  })
  await page.goto('/')
  await expect(page.getByTestId('theme')).toHaveText('dark')
  const seen = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen)
  expect(seen.length).toBeGreaterThan(0)
  expect(seen.some((value) => value.includes('light'))).toBe(false)
})

for (const scheme of ['light', 'dark'] as const) {
  test(`axe finds no violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/')
    await page.getByTestId(scheme === 'dark' ? 'set-dark' : 'set-light').click()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}
