import { DEFAULTS, DIRECTIONAL, type DirectionName, type OriginChoice } from './effects'

export interface DemoOptions {
  effect: string
  duration: number
  easing: string
  direction: DirectionName
  origin: OriginChoice
}

/** The code a visitor would write to get the effect on screen, for the current controls. */
export function buildSnippets(options: DemoOptions): { usage: string; config: string } {
  const { effect, duration, easing, direction, origin } = options
  const directional = DIRECTIONAL.includes(effect)
  const differs = {
    duration: duration !== DEFAULTS.duration,
    easing: easing !== DEFAULTS.easing,
    direction: directional && direction !== DEFAULTS.direction,
  }

  const config = [`transition: '${effect}'`]
  if (differs.duration) config.push(`duration: ${duration}`)
  if (differs.easing) config.push(`easing: '${easing}'`)

  return {
    usage: origin === 'click' ? componentUsage(options, differs) : callUsage(options, differs),
    config: [
      'export default defineNuxtConfig({',
      "  modules: ['@nuxtjs/color-mode', 'nuxt-penumbra'],",
      '  penumbra: {',
      ...config.map((line) => `    ${line},`),
      '  },',
      '})',
    ].join('\n'),
  }
}

interface Differs {
  duration: boolean
  easing: boolean
  direction: boolean
}

function componentUsage({ effect, duration, easing, direction }: DemoOptions, differs: Differs): string {
  const attrs = [`transition="${effect}"`]
  if (differs.duration) attrs.push(`:duration="${duration}"`)
  if (differs.easing) attrs.push(`easing="${easing}"`)
  if (differs.direction) attrs.push(`direction="${direction}"`)
  if (attrs.length <= 2) return `<PenumbraToggle ${attrs.join(' ')} />`
  return ['<PenumbraToggle', ...attrs.map((attr) => `  ${attr}`), '/>'].join('\n')
}

function callUsage({ effect, duration, easing, direction }: DemoOptions, differs: Differs): string {
  const fields = [`transition: '${effect}'`]
  if (differs.duration) fields.push(`duration: ${duration}`)
  if (differs.easing) fields.push(`easing: '${easing}'`)
  if (differs.direction) fields.push(`direction: '${direction}'`)
  fields.push("origin: 'center'")
  return [
    'const { toggleTheme } = usePenumbra()',
    '',
    'toggleTheme({',
    ...fields.map((field) => `  ${field},`),
    '})',
  ].join('\n')
}
