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
  await expect(toggle).toHaveAttribute('aria-label', 'Theme: dark. Switch to sepia.')
})

test('nothing is announced when the theme changes', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0)
})

for (const scheme of ['light', 'dark'] as const) {
  test(`axe finds no violations (${scheme})`, async ({ page }) => {
    await page.goto('/')
    await page.getByTestId(scheme === 'dark' ? 'set-dark' : 'set-system').click()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}
