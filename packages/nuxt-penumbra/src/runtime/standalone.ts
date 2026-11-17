import { reactive, watch } from 'vue'

import type { ColorModeLike } from './controller'
import { SYSTEM, supportsSystem, type StandaloneConfig } from './head-script'

export { SYSTEM, supportsSystem, buildHeadScript, type StandaloneConfig } from './head-script'

export type ThemeState = ColorModeLike & { preference: string; value: string }

const isPreference = (config: StandaloneConfig, value: string | null | undefined): value is string =>
  value != null && (value === SYSTEM ? supportsSystem(config.themes) : config.themes.includes(value))

/** The theme a device with no stored choice would show: the default, resolved. Used for server rendering. */
export function initialState(config: StandaloneConfig): ThemeState {
  const preference = config.default
  return { preference, value: preference === SYSTEM ? 'light' : preference, forced: false }
}

/**
 * A minimal theme store with the same shape as `@nuxtjs/color-mode`'s instance, so one controller animates both.
 * Writing `preference` stores it, resolves it and applies it to `<html>` synchronously, which is what a view
 * transition's update callback needs.
 */
export function createStandaloneStore(config: StandaloneConfig, state: ThemeState = reactive(initialState(config))) {
  const root = document.documentElement
  const media = matchMedia('(prefers-color-scheme: dark)')
  // Set while the store follows the outside (another tab, the system) instead of the visitor, so nothing is stored.
  let following = false

  function readStored(): string {
    let stored: string | null | undefined
    try {
      stored = localStorage.getItem(config.storageKey)
    } catch {
      // Storage is unreadable: the head script already applied the theme, so the page itself is the choice.
      stored = fromPage()
    }
    return isPreference(config, stored) ? stored : config.default
  }

  function fromPage(): string | undefined {
    if (config.attribute === 'class') return config.themes.find((theme) => root.classList.contains(theme))
    const value = root.getAttribute(config.attribute)
    return config.themes.find((theme) => theme === value)
  }

  const resolve = (preference: string): string =>
    preference === SYSTEM ? (media.matches ? 'dark' : 'light') : preference

  function apply(theme: string): void {
    if (config.attribute === 'class') {
      for (const name of config.themes) root.classList.toggle(name, name === theme)
    } else {
      root.setAttribute(config.attribute, theme)
    }
  }

  function persist(preference: string): void {
    try {
      localStorage.setItem(config.storageKey, preference)
    } catch {
      // Blocked or full storage: the choice still applies to this page.
    }
  }

  function sync(preference: string): void {
    const theme = resolve(preference)
    state.value = theme
    apply(theme)
  }

  const stop = watch(
    () => state.preference,
    (preference) => {
      if (!isPreference(config, preference)) return
      if (!following) persist(preference)
      sync(preference)
    },
    { flush: 'sync' },
  )

  function follow(preference: string): void {
    following = true
    try {
      state.preference = preference
      sync(preference)
    } finally {
      following = false
    }
  }

  const onMedia = (): void => {
    if (state.preference === SYSTEM) follow(SYSTEM)
  }
  const onStorage = (event: StorageEvent): void => {
    if (event.key === null || event.key === config.storageKey) follow(readStored())
  }

  /** Adopt what the head script applied before hydration, and start following the system and other tabs. */
  function start(): void {
    follow(readStored())
    media.addEventListener('change', onMedia)
    addEventListener('storage', onStorage)
  }

  function dispose(): void {
    stop()
    media.removeEventListener('change', onMedia)
    removeEventListener('storage', onStorage)
  }

  return { state, start, dispose }
}
