import type { ResolvedOptions } from './module'
import { SYSTEM, supportsSystem } from './runtime/head-script'

const NAME = /^[a-z][a-z0-9-]*$/i

/** Throws a readable error for options the module cannot use. */
export function validate(options: ResolvedOptions): void {
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
  if (typeof options.easing !== 'string' || options.easing.trim() === '') {
    throw new Error('nuxt-penumbra: `easing` must be a non-empty CSS easing, such as "ease-in-out".')
  }
  if (!Number.isFinite(options.duration) || options.duration < 0) {
    throw new Error('nuxt-penumbra: `duration` must be a number of milliseconds, 0 or more.')
  }
}
