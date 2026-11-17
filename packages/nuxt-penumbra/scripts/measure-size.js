// Writes what size-limit measures to .size/: the standalone head script for two configs, and the PenumbraToggle
// component compiled to plain JS, since esbuild cannot read a .vue file. Run after `bun run build:lib`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { compileScript, parse } from 'vue/compiler-sfc'

import { buildHeadScript } from '../dist/runtime/head-script.js'

const packageDir = join(import.meta.dirname, '..')
const dir = join(packageDir, '.size')
mkdirSync(dir, { recursive: true })

const base = { themes: ['light', 'dark'], default: 'system', attribute: 'data-theme', storageKey: 'penumbra-theme' }
writeFileSync(join(dir, 'head-inline.js'), buildHeadScript(base))
writeFileSync(
  join(dir, 'head-inline-class.js'),
  buildHeadScript({ ...base, themes: ['light', 'dark', 'sepia', 'forest'], attribute: 'class' }),
)

const source = readFileSync(join(packageDir, 'dist/runtime/components/PenumbraToggle.vue'), 'utf8')
const { descriptor } = parse(source, { filename: 'PenumbraToggle.vue' })
const { content } = compileScript(descriptor, { id: 'penumbra-toggle', inlineTemplate: true })
// The composable is part of the client runtime, which is measured on its own. Point the import at a package name
// that size-limit ignores, so this budget covers only the component's own code.
const toggle = content.replace(/(from\s*['"])\.\.\/composables\/usePenumbra(['"])/, '$1penumbra-composable$2')
writeFileSync(join(dir, 'toggle.js'), toggle)
