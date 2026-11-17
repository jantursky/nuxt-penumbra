import { expect, test } from '@playwright/test'

import { collectErrors, countViewTransitions, pickEffect, viewTransitions } from './helpers'

test.use({ colorScheme: 'light' })

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
]

test.beforeEach(async ({ page }) => {
  await page.goto('/transitions')
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-label', /Theme: /)
  await page.getByLabel('Duration').fill('150')
})

test('every effect can be picked and run without console errors', async ({ page }) => {
  const errors = collectErrors(page)
  const html = page.locator('html')
  for (const [index, effect] of effects.entries()) {
    await pickEffect(page, effect)
    await expect(page.getByRole('region', { name: 'Component' })).toContainText(`transition="${effect}"`)
    await page.getByTestId('run').click()
    await expect(html).toHaveClass(index % 2 === 0 ? /dark/ : /light/)
    await page.waitForTimeout(300)
  }
  expect(errors).toEqual([])
})

test('the code beside the demo follows the controls', async ({ page }) => {
  await pickEffect(page, 'wipe')
  await page.getByLabel('Direction (wipe and blinds)').selectOption('left')
  await page.getByLabel('Easing').selectOption('linear')
  const component = page.getByRole('region', { name: 'Component' })
  await expect(component).toContainText('direction="left"')
  await expect(component).toContainText('easing="linear"')
  await page.getByLabel('Origin').selectOption('center')
  await expect(page.getByRole('region', { name: 'Call' })).toContainText("origin: 'center'")
  await expect(page.getByRole('region', { name: 'nuxt.config.ts' })).toContainText("transition: 'wipe'")
})

test('the direction control is only enabled for wipe and blinds', async ({ page }) => {
  const direction = page.getByLabel('Direction (wipe and blinds)')
  await expect(direction).toBeDisabled()
  await pickEffect(page, 'blinds')
  await expect(direction).toBeEnabled()
})

test.describe('with the View Transitions API', () => {
  test.skip(({ browserName }) => browserName === 'firefox', 'No View Transitions API in this Firefox build')

  test('a run starts one view transition', async ({ page }) => {
    await countViewTransitions(page)
    await page.getByTestId('run').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(await viewTransitions(page)).toBe(1)
  })

  test('the reduced motion switch starts none', async ({ page }) => {
    await countViewTransitions(page)
    await page.getByRole('switch', { name: 'Simulate reduced motion' }).check()
    await expect(page.getByRole('region', { name: 'Component' })).toContainText(':duration="0"')
    await page.getByTestId('run').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(await viewTransitions(page)).toBe(0)
  })

  test('the system reduced motion setting wins over the controls', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await countViewTransitions(page)
    await page.getByTestId('run').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(await viewTransitions(page)).toBe(0)
    await expect(page.getByText('Your system asks for reduced motion.')).toBeVisible()
  })
})
