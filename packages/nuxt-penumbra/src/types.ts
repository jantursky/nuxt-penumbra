import type { ResolvedOptions } from './module'

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    penumbra: ResolvedOptions
  }
}

export type { ModuleOptions } from './module'
export type {
  Penumbra,
  SetThemeOptions,
  Direction,
  Origin,
  TransitionContext,
  TransitionDefinition,
} from './runtime/composables/usePenumbra'
