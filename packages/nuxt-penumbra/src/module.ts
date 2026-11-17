import type { NuxtModule } from '@nuxt/schema'
import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule, hasNuxtModule } from '@nuxt/kit'

import { buildHeadScript, SYSTEM, supportsSystem } from './runtime/head-script'

export interface ModuleOptions {
  /**
   * `'color-mode'` animates changes to `@nuxtjs/color-mode`'s `preference` and never stores a theme itself.
   * `'standalone'` keeps its own store. Default: `'color-mode'` when `@nuxtjs/color-mode` is installed, else `'standalone'`.
   */
  mode?: 'color-mode' | 'standalone'
  /** Theme names, in the order `toggleTheme()` cycles through them. Default `['light', 'dark']`. */
  themes?: string[]
  /** Effect used when a call does not name one. Default `'circle'`. */
  transition?: string
  /** Effect duration in milliseconds. Default `500`. */
  duration?: number
  /** CSS easing of the effect. Default `'ease-in-out'`. */
  easing?: string
  /** Standalone mode: theme to use before the visitor picks one, or `'system'` to follow `prefers-color-scheme`. Default `'system'`. */
  default?: string
  /** Standalone mode: `'class'` toggles a class on `<html>`; `'data-*'` sets that attribute. Default `'data-theme'`. */
  attribute?: 'class' | `data-${string}`
  /** Standalone mode: localStorage key that holds the visitor's choice. Default `'penumbra-theme'`. */
  storageKey?: string
}

export type ResolvedOptions = Required<ModuleOptions>

export type {
  Direction,
  Origin,
  Penumbra,
  SetThemeOptions,
  TransitionContext,
  TransitionDefinition,
} from './runtime/composables/usePenumbra'

const NAME = /^[a-z][a-z0-9-]*$/i

const penumbra: NuxtModule<ModuleOptions, ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-penumbra',
    configKey: 'penumbra',
    compatibility: { nuxt: '>=3.12.0' },
  },
  // Sets up after color-mode when another module (Nuxt UI) installs it, so `hasNuxtModule` sees it. Optional: the
  // module also works without it.
  moduleDependencies: { '@nuxtjs/color-mode': { optional: true } },
  defaults: {
    transition: 'circle',
    duration: 500,
    easing: 'ease-in-out',
    default: SYSTEM,
    attribute: 'data-theme',
    storageKey: 'penumbra-theme',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    // Wait for every module: Nuxt UI installs `@nuxtjs/color-mode` as a dependency of its own, after ours has been set up.
    nuxt.hook('modules:done', () => {
      const mode = options.mode ?? (hasNuxtModule('@nuxtjs/color-mode', nuxt) ? 'color-mode' : 'standalone')
      // `themes` has no entry in `defaults`: Nuxt merges arrays with `defu`, which would append the user's list to ours.
      const resolved: ResolvedOptions = {
        ...(options as ResolvedOptions),
        themes: options.themes ?? ['light', 'dark'],
        mode,
      }
      validate(resolved)

      if (mode === 'color-mode' && !hasNuxtModule('@nuxtjs/color-mode', nuxt)) {
        throw new Error('nuxt-penumbra: mode "color-mode" needs `@nuxtjs/color-mode` in `modules`.')
      }

      nuxt.options.build.transpile.push(resolver.resolve('./runtime'))
      nuxt.options.runtimeConfig.public.penumbra = resolved

      // Standalone mode has no color-mode script to prevent a flash, so it brings its own, first in <head>.
      if (mode === 'standalone') {
        nuxt.options.app.head.script ??= []
        nuxt.options.app.head.script.push({
          innerHTML: buildHeadScript(resolved),
          tagPosition: 'head',
          tagPriority: 'critical',
        })
      }

      addPlugin(resolver.resolve('./runtime/plugin.client'))
      addComponent({ name: 'PenumbraToggle', filePath: resolver.resolve('./runtime/components/PenumbraToggle.vue') })
      addImports([
        { name: 'usePenumbra', from: resolver.resolve('./runtime/composables/usePenumbra') },
        { name: 'definePenumbraTransition', from: resolver.resolve('./runtime/composables/usePenumbra') },
      ])
    })
  },
})

export default penumbra

function validate(options: ResolvedOptions): void {
  if (options.themes.length === 0) throw new Error('nuxt-penumbra: `themes` needs at least one theme.')
  for (const theme of options.themes) {
    if (!NAME.test(theme)) {
      throw new Error(
        `nuxt-penumbra: invalid theme name "${theme}". Use letters, digits and dashes, starting with a letter.`,
      )
    }
  }
  if (new Set(options.themes).size !== options.themes.length) {
    throw new Error('nuxt-penumbra: `themes` contains duplicates.')
  }
  if (options.themes.includes(SYSTEM))
    throw new Error('nuxt-penumbra: "system" is reserved and cannot be a theme name.')
  if (options.mode === 'standalone') {
    if (options.default === SYSTEM ? !supportsSystem(options.themes) : !options.themes.includes(options.default)) {
      throw new Error(
        options.default === SYSTEM
          ? 'nuxt-penumbra: `default: "system"` needs the themes "light" and "dark".'
          : `nuxt-penumbra: \`default\` "${options.default}" is not in \`themes\`.`,
      )
    }
    if (!/^(class|data-[a-z][a-z0-9-]*)$/.test(options.attribute)) {
      throw new Error(`nuxt-penumbra: \`attribute\` must be "class" or "data-*", got "${options.attribute}".`)
    }
    if (options.storageKey === '') throw new Error('nuxt-penumbra: `storageKey` cannot be empty.')
  }
  if (!Number.isFinite(options.duration) || options.duration < 0) {
    throw new Error('nuxt-penumbra: `duration` must be a number of milliseconds, 0 or more.')
  }
}
