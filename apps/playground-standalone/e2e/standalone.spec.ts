import { expect, test } from '@playwright/test'

test('toggle cycles the configured themes and stores the choice', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByTestId('toggle').click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await page.evaluate(() => localStorage.getItem('penumbra-theme'))).toBe('dark')
})

test('a stored choice is on <html> before first paint and never flashes the default', async ({ page }) => {
  await page.addInitScript(() => {
    const seen: (string | null)[] = []
    ;(window as unknown as { __seen: typeof seen }).__seen = seen
    new MutationObserver(() => {
      seen.push(document.documentElement.getAttribute('data-theme'))
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-theme'] })
    localStorage.setItem('penumbra-theme', 'dark')
  })
  await page.goto('/')
  await expect(page.getByTestId('theme')).toHaveText('dark')
  const seen = await page.evaluate(() => (window as unknown as { __seen: (string | null)[] }).__seen)
  expect(seen.length).toBeGreaterThan(0)
  expect(seen).not.toContain('light')
  expect(seen).not.toContain(null)
})

test('the choice survives a client-side navigation and a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('set-sepia').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'sepia')
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'sepia')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'sepia')
})

test('system follows prefers-color-scheme live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await page.getByTestId('set-system').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByTestId('theme')).toHaveText('dark')
})

test('animates the switch inside a view transition where the browser has them', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox')
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
  await expect(page.getByTestId('theme')).toHaveText('dark')
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(1)
})
