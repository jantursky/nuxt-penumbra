import type { ComputedRef } from 'vue'
import { describe, expectTypeOf, test } from 'vitest'

import type { ModuleOptions } from '../src/module'
import {
  definePenumbraTransition,
  type Direction,
  type Penumbra,
  type SetThemeOptions,
  type TransitionContext,
  type TransitionDefinition,
} from '../src/runtime/composables/usePenumbra'

describe('usePenumbra()', () => {
  test('the reactive state', () => {
    expectTypeOf<Penumbra['theme']>().toEqualTypeOf<ComputedRef<string>>()
    expectTypeOf<Penumbra['preference']>().toEqualTypeOf<ComputedRef<string>>()
    expectTypeOf<Penumbra['themes']>().toEqualTypeOf<readonly string[]>()
  })

  test('the calls', () => {
    expectTypeOf<Penumbra['setTheme']>().toEqualTypeOf<(preference: string, options?: SetThemeOptions) => void>()
    expectTypeOf<Penumbra['toggleTheme']>().toEqualTypeOf<(options?: SetThemeOptions) => void>()
  })

  test('the field list is closed', () => {
    expectTypeOf<keyof Penumbra>().toEqualTypeOf<'theme' | 'preference' | 'themes' | 'setTheme' | 'toggleTheme'>()
  })
})

describe('SetThemeOptions', () => {
  test('every field is optional', () => {
    const empty: SetThemeOptions = {}
    expectTypeOf(empty).toExtend<SetThemeOptions>()
  })

  test('the fields', () => {
    expectTypeOf<SetThemeOptions['transition']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SetThemeOptions['duration']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<SetThemeOptions['easing']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<SetThemeOptions['direction']>().toEqualTypeOf<Direction | undefined>()
  })

  test('a click event is a valid origin', () => {
    expectTypeOf<{ origin: MouseEvent }>().toExtend<SetThemeOptions>()
  })

  test('a wrong value is rejected', () => {
    // @ts-expect-error duration is a number
    const wrong: SetThemeOptions = { duration: '500' }
    expectTypeOf(wrong).toBeObject()
  })
})

describe('ModuleOptions', () => {
  test('the fields', () => {
    expectTypeOf<ModuleOptions['mode']>().toEqualTypeOf<'color-mode' | 'standalone' | undefined>()
    expectTypeOf<ModuleOptions['themes']>().toEqualTypeOf<string[] | undefined>()
    expectTypeOf<ModuleOptions['duration']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<ModuleOptions['storageKey']>().toEqualTypeOf<string | undefined>()
  })

  test('attribute is a class or a data attribute', () => {
    expectTypeOf<ModuleOptions['attribute']>().toEqualTypeOf<'class' | `data-${string}` | undefined>()
  })

  test('an unknown mode is rejected', () => {
    // @ts-expect-error only 'color-mode' and 'standalone' exist
    const wrong: ModuleOptions = { mode: 'auto' }
    // @ts-expect-error an attribute must be `class` or `data-*`
    const wrongAttribute: ModuleOptions = { attribute: 'theme' }
    expectTypeOf(wrong).toBeObject()
    expectTypeOf(wrongAttribute).toBeObject()
  })
})

describe('definePenumbraTransition()', () => {
  test('takes a name and a definition and returns the definition', () => {
    expectTypeOf(definePenumbraTransition).parameters.toEqualTypeOf<[name: string, definition: TransitionDefinition]>()
    expectTypeOf(definePenumbraTransition).returns.toEqualTypeOf<TransitionDefinition>()
  })

  test('keyframes are built from the context', () => {
    expectTypeOf<TransitionDefinition['new']>().toEqualTypeOf<
      ((context: TransitionContext) => Keyframe[]) | undefined
    >()
    expectTypeOf<TransitionContext['direction']>().toEqualTypeOf<Direction>()
  })

  test('a definition with a wrong layer is rejected', () => {
    // @ts-expect-error `top` is 'old' or 'new'
    const wrong: TransitionDefinition = { top: 'middle' }
    expectTypeOf(wrong).toBeObject()
  })
})
