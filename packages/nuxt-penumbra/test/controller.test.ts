import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runTransition } from 'penumbra-core'

import { createController, type ColorModeLike } from '../src/runtime/controller'

vi.mock('penumbra-core', () => ({ runTransition: vi.fn() }))

const options = { themes: ['light', 'dark', 'sepia'], transition: 'circle', duration: 500, easing: 'ease-in-out' }

function setup(initial: Partial<{ preference: string; value: string; forced: boolean }> = {}) {
  const colorMode = { preference: 'light', value: 'light', forced: false, ...initial } as ColorModeLike & {
    value: string
  }
  const env = {
    nextTick: vi.fn(() => Promise.resolve()),
    isBusy: vi.fn(() => false),
    lastClick: vi.fn((): MouseEvent | undefined => undefined),
  }
  const controller = createController(() => colorMode, options, env)
  const requestOf = () => vi.mocked(runTransition).mock.calls[0]![1]
  const changeOf = () => vi.mocked(runTransition).mock.calls[0]![0]
  return { colorMode, env, controller, requestOf, changeOf }
}

beforeEach(() => {
  vi.mocked(runTransition).mockReset()
  vi.unstubAllGlobals()
})

describe('setTheme', () => {
  it('wraps the write in a transition built from the module options', () => {
    const { controller, requestOf, colorMode, env } = setup()
    controller.setTheme('dark')
    expect(runTransition).toHaveBeenCalledOnce()
    expect(requestOf()).toMatchObject({
      name: 'circle',
      duration: 500,
      easing: 'ease-in-out',
      direction: 'right',
      guardCss: true,
      isBusy: env.isBusy,
    })
    // Nothing is written until the browser has taken the old snapshot and runs the update callback.
    expect(colorMode.preference).toBe('light')
  })

  it('writes the preference and waits for Vue inside the update callback', async () => {
    const { controller, changeOf, colorMode, env } = setup()
    controller.setTheme('dark')
    const done = changeOf()()
    expect(colorMode.preference).toBe('dark')
    await done
    expect(env.nextTick).toHaveBeenCalledOnce()
  })

  it('lets a call override the effect, duration, easing, origin and direction', () => {
    const { controller, requestOf } = setup()
    const origin = { x: 1, y: 2 }
    controller.setTheme('dark', { transition: 'wipe', duration: 100, easing: 'linear', origin, direction: 'up' })
    expect(requestOf()).toMatchObject({
      name: 'wipe',
      duration: 100,
      easing: 'linear',
      origin,
      direction: 'up',
    })
  })

  it('starts the reveal at the latest click when the call gives no origin', () => {
    const { controller, requestOf, env } = setup()
    const click = new MouseEvent('click')
    env.lastClick.mockReturnValue(click)
    controller.setTheme('dark')
    expect(requestOf().origin).toBe(click)
  })

  it('writes at once when the resolved theme does not change', () => {
    const { controller, colorMode } = setup({ value: 'dark', preference: 'system' })
    controller.setTheme('dark')
    expect(runTransition).not.toHaveBeenCalled()
    expect(colorMode.preference).toBe('dark')
  })

  it.each([
    ['dark', true],
    ['light', false],
  ])('resolves "system" to the device scheme (dark: %s => %s)', (_name, dark) => {
    vi.stubGlobal('matchMedia', () => ({ matches: dark }))
    const { controller, colorMode } = setup({ value: dark ? 'dark' : 'light' })
    controller.setTheme('system')
    expect(runTransition).not.toHaveBeenCalled()
    expect(colorMode.preference).toBe('system')
  })

  it('resolves "system" to light where matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { controller, colorMode } = setup({ value: 'light' })
    controller.setTheme('system')
    expect(colorMode.preference).toBe('system')
  })

  it('writes at once on a page that forces a color mode', () => {
    const { controller, colorMode } = setup({ forced: true })
    controller.setTheme('dark')
    expect(runTransition).not.toHaveBeenCalled()
    expect(colorMode.preference).toBe('dark')
  })

  it('writes at once without a document', () => {
    vi.stubGlobal('document', undefined)
    const { controller, colorMode } = setup()
    controller.setTheme('dark')
    expect(runTransition).not.toHaveBeenCalled()
    expect(colorMode.preference).toBe('dark')
  })
})

describe('rapid calls', () => {
  it('ends on the later theme when a second call goes back before the first has run', () => {
    const { controller, colorMode } = setup({ value: 'light' })
    controller.setTheme('dark')
    controller.setTheme('light')
    expect(runTransition).toHaveBeenCalledTimes(2)
    // The browser runs the callbacks in order; the first is stale and must not write.
    const [first, second] = vi.mocked(runTransition).mock.calls.map(([change]) => change)
    void first!()
    expect(colorMode.preference).toBe('light')
    void second!()
    expect(colorMode.preference).toBe('light')
  })

  it('keeps one change in flight for the same target and writes the preference asked for last', () => {
    const { controller, colorMode, changeOf } = setup({ value: 'light' })
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    controller.setTheme('dark')
    controller.setTheme('system')
    expect(runTransition).toHaveBeenCalledOnce()
    void changeOf()()
    expect(colorMode.preference).toBe('system')
  })

  it('toggles from the theme in flight, not from the one still on screen', () => {
    const { controller, requestOf } = setup({ value: 'light' })
    controller.toggleTheme()
    controller.toggleTheme()
    expect(vi.mocked(runTransition)).toHaveBeenCalledTimes(2)
    expect(requestOf().name).toBe('circle')
    const [first, second] = vi.mocked(runTransition).mock.calls.map(([change]) => change)
    void first!()
    void second!()
  })

  it('writes at once, and drops what was in flight, when the page becomes forced', () => {
    const { controller, colorMode } = setup({ value: 'light' })
    controller.setTheme('dark')
    ;(colorMode as { forced: boolean }).forced = true
    controller.setTheme('sepia')
    expect(colorMode.preference).toBe('sepia')
    const [first] = vi.mocked(runTransition).mock.calls.map(([change]) => change)
    void first!()
    expect(colorMode.preference).toBe('sepia')
  })
})

describe('toggleTheme', () => {
  it('moves to the next configured theme and wraps around', () => {
    const { controller, colorMode } = setup({ value: 'sepia', forced: true })
    controller.toggleTheme()
    expect(colorMode.preference).toBe('light')
  })

  it('starts from the first theme when the current one is not configured', () => {
    const { controller, colorMode } = setup({ value: 'purple', forced: true })
    controller.toggleTheme()
    expect(colorMode.preference).toBe('light')
  })

  it('passes the options on', () => {
    const { controller, requestOf } = setup()
    controller.toggleTheme({ transition: 'fade' })
    expect(requestOf().name).toBe('fade')
  })

  it('does nothing with an empty theme list', () => {
    const colorMode = { preference: 'light', value: 'light', forced: false }
    const controller = createController(
      () => colorMode,
      { ...options, themes: [] },
      { nextTick: () => Promise.resolve(), isBusy: () => false, lastClick: () => undefined },
    )
    controller.toggleTheme()
    expect(runTransition).not.toHaveBeenCalled()
  })
})

describe('intercept', () => {
  it('puts a foreign write back and replays it inside a transition', () => {
    const { controller, colorMode, changeOf } = setup({ preference: 'light' })
    // Nuxt UI wrote "dark" straight to the instance:
    colorMode.preference = 'dark'
    controller.intercept('dark', 'light')
    expect(colorMode.preference).toBe('light')
    expect(runTransition).toHaveBeenCalledOnce()
    void changeOf()()
    expect(colorMode.preference).toBe('dark')
  })

  it('ignores the writes the controller makes itself', () => {
    const { controller, colorMode, changeOf } = setup()
    let seen = 0
    // The interceptor runs synchronously inside `write`, as the real watcher does.
    const original = colorMode
    Object.defineProperty(original, 'preference', {
      configurable: true,
      get: () => 'light',
      set: (value: string) => {
        seen++
        controller.intercept(value, 'light')
      },
    })
    controller.setTheme('dark')
    void changeOf()()
    expect(seen).toBe(1)
    expect(runTransition).toHaveBeenCalledOnce()
  })

  it.each([
    ['a forced page', { forced: true }, 'dark', 'light'],
    ['an unchanged value', {}, 'light', 'light'],
  ])('leaves %s alone', (_name, state, next, previous) => {
    const { controller } = setup(state)
    controller.intercept(next, previous)
    expect(runTransition).not.toHaveBeenCalled()
  })
})
