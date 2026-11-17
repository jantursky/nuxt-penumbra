export const EFFECTS = [
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
] as const

/** The effects that read the `direction` option. */
export const DIRECTIONAL: readonly string[] = ['wipe', 'blinds']

export const DIRECTIONS = ['right', 'left', 'down', 'up'] as const
export type DirectionName = (typeof DIRECTIONS)[number]

export const EASINGS = [
  'ease-in-out',
  'ease',
  'ease-in',
  'ease-out',
  'linear',
  'cubic-bezier(0.22, 1, 0.36, 1)',
] as const

export type OriginChoice = 'click' | 'center'

/** What nuxt-penumbra uses when a call or the config leaves an option out. */
export const DEFAULTS = { duration: 500, easing: 'ease-in-out', direction: 'right' } as const
