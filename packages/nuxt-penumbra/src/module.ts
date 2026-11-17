import type { NuxtModule } from '@nuxt/schema'
import { addImports, addPlugin, createResolver, defineNuxtModule, hasNuxtModule } from '@nuxt/kit'

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
}

export type ResolvedOptions = Required<ModuleOptions>

const NAME = /^[a-z][a-z0-9-]*$/i

const penumbra: NuxtModule<ModuleOptions, ModuleOptions, false> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-penumbra',
    configKey: 'penumbra',
    compatibility: { nuxt: '>=3.12.0' },
  },
  defaults: {
    themes: ['light', 'dark'],
    transition: 'circle',
    duration: 500,
    easing: 'ease-in-out',
  },
  setup(options, nuxt) {
    const mode = options.mode ?? (hasNuxtModule('@nuxtjs/color-mode', nuxt) ? 'color-mode' : 'standalone')
    const resolved: ResolvedOptions = { ...(options as ResolvedOptions), mode }
    validate(resolved)

    // Standalone mode arrives in a later commit; until then the module only registers its types.
    if (mode === 'standalone') return
    if (!hasNuxtModule('@nuxtjs/color-mode', nuxt)) {
      throw new Error('nuxt-penumbra: mode "color-mode" needs `@nuxtjs/color-mode` in `modules`.')
    }

    const resolver = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'))
    nuxt.options.runtimeConfig.public.penumbra = resolved

    addPlugin(resolver.resolve('./runtime/plugin.client'))
    addImports([
      { name: 'usePenumbra', from: resolver.resolve('./runtime/composables/usePenumbra') },
      { name: 'definePenumbraTransition', from: resolver.resolve('./runtime/composables/usePenumbra') },
    ])
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
  if (!Number.isFinite(options.duration) || options.duration < 0) {
    throw new Error('nuxt-penumbra: `duration` must be a number of milliseconds, 0 or more.')
  }
}
