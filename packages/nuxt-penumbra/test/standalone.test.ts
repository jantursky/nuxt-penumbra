import { reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildHeadScript,
  createStandaloneStore,
  initialState,
  supportsSystem,
  type StandaloneConfig,
} from '../src/runtime/standalone'

const base: StandaloneConfig = {
  themes: ['light', 'dark', 'sepia'],
  default: 'system',
  attribute: 'data-theme',
  storageKey: 'penumbra-theme',
}

function mockMedia(initialDark = false) {
  let dark = initialDark
  const listeners = new Set<() => void>()
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return dark
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }))
  return {
    set(value: boolean) {
      dark = value
      listeners.forEach((fn) => {
        fn()
      })
    },
    listeners,
  }
}

function blockStorage({ read = false, write = false }) {
  const real = localStorage
  const fail = (): never => {
    throw new DOMException('blocked', 'SecurityError')
  }
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (read ? fail() : real.getItem(key)),
    setItem: (key: string, value: string) => {
      if (write) fail()
      real.setItem(key, value)
    },
  })
}

const root = document.documentElement

beforeEach(() => {
  root.removeAttribute('data-theme')
  root.className = ''
  localStorage.clear()
})
const stores: { dispose: () => void }[] = []
afterEach(() => {
  // A started store listens on `window` for the rest of the file unless it is disposed.
  for (const store of stores.splice(0)) store.dispose()
  vi.unstubAllGlobals()
})

function setup(config: StandaloneConfig = base) {
  const store = createStandaloneStore(config, reactive(initialState(config)))
  stores.push(store)
  return store
}

describe('initialState', () => {
  it('shows light for the system default until the browser is known', () => {
    expect(initialState(base)).toEqual({ preference: 'system', value: 'light', forced: false })
  })
  it('uses a named default as is', () => {
    expect(initialState({ ...base, default: 'sepia' })).toEqual({ preference: 'sepia', value: 'sepia', forced: false })
  })
})

describe('supportsSystem', () => {
  it('needs light and dark', () => {
    expect(supportsSystem(['light', 'dark'])).toBe(true)
    expect(supportsSystem(['light', 'sepia'])).toBe(false)
  })
})

describe('store', () => {
  it('adopts the stored choice on start and applies it', () => {
    mockMedia()
    localStorage.setItem('penumbra-theme', 'sepia')
    const { state, start } = setup()
    start()
    expect(state).toMatchObject({ preference: 'sepia', value: 'sepia' })
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('ignores a stored "system" when the themes have no light and dark pair', () => {
    mockMedia()
    localStorage.setItem('penumbra-theme', 'system')
    const { state, start } = setup({ ...base, themes: ['light', 'sepia'], default: 'sepia' })
    start()
    expect(state.preference).toBe('sepia')
  })

  it('uses the default when nothing is stored', () => {
    mockMedia()
    const { state, start } = setup({ ...base, default: 'sepia' })
    start()
    expect(state).toMatchObject({ preference: 'sepia', value: 'sepia' })
  })

  it('falls back to the default for a stored value that is not a theme', () => {
    mockMedia(true)
    localStorage.setItem('penumbra-theme', 'nope')
    const { state, start } = setup()
    start()
    expect(state).toMatchObject({ preference: 'system', value: 'dark' })
  })

  it('stores and applies a written preference', () => {
    mockMedia()
    const { state, start } = setup()
    start()
    state.preference = 'dark'
    expect(localStorage.getItem('penumbra-theme')).toBe('dark')
    expect(state.value).toBe('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
  })

  it('puts the last valid choice back after a write that is not a theme', () => {
    mockMedia()
    const { state, start } = setup()
    start()
    state.preference = 'dark'
    state.preference = 'nope'
    expect(state.preference).toBe('dark')
    expect(localStorage.getItem('penumbra-theme')).toBe('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
  })

  it('hands the head script over to the store while it runs, and back after dispose', () => {
    mockMedia()
    const { start, dispose } = setup()
    start()
    expect((window as unknown as Record<string, unknown>).__penumbraStore).toBe(true)
    dispose()
    expect((window as unknown as Record<string, unknown>).__penumbraStore).toBeUndefined()
  })

  it('toggles classes in class mode and leaves other classes alone', () => {
    mockMedia()
    root.classList.add('keep', 'light')
    const { state, start } = setup({ ...base, attribute: 'class' })
    start()
    state.preference = 'dark'
    expect([...root.classList].sort()).toEqual(['dark', 'keep'])
  })

  it('follows the system while the choice is system', () => {
    const media = mockMedia()
    const { state, start } = setup()
    start()
    expect(state.value).toBe('light')
    media.set(true)
    expect(state.value).toBe('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
    // A system change is not a choice: nothing is stored.
    expect(localStorage.getItem('penumbra-theme')).toBeNull()
  })

  it('does not follow the system once a theme is chosen', () => {
    const media = mockMedia()
    const { state, start } = setup()
    start()
    state.preference = 'sepia'
    media.set(true)
    expect(state.value).toBe('sepia')
  })

  it.each([
    ['the key changes', 'dark', 'penumbra-theme'],
    ['all storage is cleared', 'system', null],
  ])('follows another tab when %s', (_name, expected, key) => {
    mockMedia()
    const { state, start } = setup()
    start()
    if (key !== null) localStorage.setItem('penumbra-theme', 'dark')
    else localStorage.clear()
    dispatchEvent(new StorageEvent('storage', { key }))
    expect(state.preference).toBe(expected)
  })

  it('ignores storage events for other keys', () => {
    mockMedia()
    const { state, start } = setup()
    start()
    state.preference = 'sepia'
    dispatchEvent(new StorageEvent('storage', { key: 'other' }))
    expect(state.preference).toBe('sepia')
  })

  it('reads the theme from the page when storage is unreadable (data attribute)', () => {
    mockMedia()
    blockStorage({ read: true })
    root.setAttribute('data-theme', 'sepia')
    const { state, start } = setup({ ...base, default: 'light' })
    start()
    expect(state.preference).toBe('sepia')
  })

  it('reads the theme from the page when storage is unreadable (class)', () => {
    mockMedia()
    blockStorage({ read: true })
    root.classList.add('dark')
    const { state, start } = setup({ ...base, attribute: 'class' })
    start()
    expect(state.preference).toBe('dark')
  })

  it('uses the default when storage is unreadable and the page names no theme', () => {
    mockMedia()
    blockStorage({ read: true })
    const { state, start } = setup({ ...base, default: 'sepia' })
    start()
    expect(state.preference).toBe('sepia')
  })

  it('still applies a choice when storage cannot be written', () => {
    mockMedia()
    blockStorage({ write: true })
    const { state, start } = setup()
    start()
    state.preference = 'dark'
    expect(root.getAttribute('data-theme')).toBe('dark')
  })

  it('stops listening after dispose', () => {
    const media = mockMedia()
    const { state, start, dispose } = setup()
    start()
    dispose()
    expect(media.listeners.size).toBe(0)
    state.preference = 'dark'
    expect(root.getAttribute('data-theme')).toBe('light')
  })
})

describe('head script', () => {
  const run = (config: StandaloneConfig, dark = false) => {
    mockMedia(dark)
    new Function(buildHeadScript(config))()
  }

  it('applies the stored theme before anything else runs', () => {
    localStorage.setItem('penumbra-theme', 'sepia')
    run(base)
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('resolves the system default through prefers-color-scheme', () => {
    run(base, true)
    expect(root.getAttribute('data-theme')).toBe('dark')
  })

  it('falls back to the default for an unknown stored value', () => {
    localStorage.setItem('penumbra-theme', 'nope')
    run({ ...base, default: 'sepia' })
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('rejects "system" when the themes have no light and dark pair', () => {
    localStorage.setItem('penumbra-theme', 'system')
    run({ ...base, themes: ['light', 'sepia'], default: 'sepia' })
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('uses the theme already on the page when storage throws', () => {
    root.setAttribute('data-theme', 'dark')
    blockStorage({ read: true })
    run(base)
    expect(root.getAttribute('data-theme')).toBe('dark')
  })

  it('uses the class already on the page when storage throws', () => {
    root.classList.add('dark')
    blockStorage({ read: true })
    run({ ...base, attribute: 'class' })
    expect([...root.classList]).toEqual(['dark'])
  })

  it('stays in step with the system and with other tabs', () => {
    const media = mockMedia()
    new Function(buildHeadScript(base))()
    expect(root.getAttribute('data-theme')).toBe('light')
    media.set(true)
    expect(root.getAttribute('data-theme')).toBe('dark')
    localStorage.setItem('penumbra-theme', 'sepia')
    dispatchEvent(new StorageEvent('storage', { key: 'penumbra-theme' }))
    expect(root.getAttribute('data-theme')).toBe('sepia')
    dispatchEvent(new StorageEvent('storage', { key: 'other' }))
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('stops following the system and other tabs once the store has taken over', () => {
    const media = mockMedia()
    new Function(buildHeadScript(base))()
    Object.assign(window, { __penumbraStore: true })
    media.set(true)
    localStorage.setItem('penumbra-theme', 'sepia')
    dispatchEvent(new StorageEvent('storage', { key: 'penumbra-theme' }))
    expect(root.getAttribute('data-theme')).toBe('light')
    Reflect.deleteProperty(window, '__penumbraStore')
  })

  it('does not follow the system once a theme is stored', () => {
    localStorage.setItem('penumbra-theme', 'sepia')
    const media = mockMedia()
    new Function(buildHeadScript(base))()
    media.set(true)
    expect(root.getAttribute('data-theme')).toBe('sepia')
  })

  it('escapes "<" so a theme name cannot close the script tag', () => {
    expect(buildHeadScript({ ...base, themes: ['a</script>'] })).not.toContain('</script>')
  })
})
