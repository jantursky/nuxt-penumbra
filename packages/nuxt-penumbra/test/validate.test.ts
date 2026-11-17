import { describe, expect, it } from 'vitest'

import type { ResolvedOptions } from '../src/module'
import { validate } from '../src/validate'

const base: ResolvedOptions = {
  mode: 'standalone',
  themes: ['light', 'dark'],
  transition: 'circle',
  duration: 500,
  easing: 'ease-in-out',
  default: 'system',
  attribute: 'data-theme',
  storageKey: 'penumbra-theme',
}

const check = (patch: Partial<ResolvedOptions>) => () => {
  validate({ ...base, ...patch })
}

describe('validate', () => {
  it('accepts the defaults in both modes', () => {
    expect(check({})).not.toThrow()
    expect(check({ mode: 'color-mode' })).not.toThrow()
  })

  it.each([
    ['no themes', { themes: [] }, 'at least one theme'],
    ['a theme name that is not a word', { themes: ['light', 'a b'] }, 'invalid theme name "a b"'],
    ['a theme name that closes a script tag', { themes: ['</script>'] }, 'invalid theme name'],
    ['duplicate themes', { themes: ['light', 'light'] }, 'duplicates'],
    ['the reserved name', { themes: ['light', 'system'] }, 'reserved'],
    ['an empty easing', { easing: ' ' }, '`easing`'],
    ['a negative duration', { duration: -1 }, '`duration`'],
    ['a duration that is not a number', { duration: Number.NaN }, '`duration`'],
  ])('rejects %s', (_name, patch, message) => {
    expect(check(patch as Partial<ResolvedOptions>)).toThrow(message)
  })

  describe('standalone options', () => {
    it('needs light and dark for the system default', () => {
      expect(check({ themes: ['light', 'sepia'] })).toThrow('needs the themes "light" and "dark"')
    })
    it('accepts a named default that is a theme, and rejects one that is not', () => {
      expect(check({ themes: ['light', 'sepia'], default: 'sepia' })).not.toThrow()
      expect(check({ default: 'sepia' })).toThrow('`default` "sepia" is not in `themes`')
    })
    it('accepts "class" and "data-*" and rejects the rest', () => {
      expect(check({ attribute: 'class' })).not.toThrow()
      expect(check({ attribute: 'data-mode' })).not.toThrow()
      expect(check({ attribute: 'style' as 'class' })).toThrow('`attribute` must be')
    })
    it('rejects an empty storage key', () => {
      expect(check({ storageKey: '' })).toThrow('`storageKey` cannot be empty')
    })
    it('skips these checks in color-mode mode, which does not use them', () => {
      expect(
        check({ mode: 'color-mode', default: 'nope', attribute: 'style' as 'class', storageKey: '' }),
      ).not.toThrow()
    })
  })
})
