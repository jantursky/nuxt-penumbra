// The root README is the source. The package README is the same text with absolute image URLs,
// because npm does not resolve relative paths. Run: bun run sync:readme
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const raw = 'https://raw.githubusercontent.com/jantursky/nuxt-penumbra/main/'
const blob = 'https://github.com/jantursky/nuxt-penumbra/blob/main/'
const source = readFileSync(join(root, 'README.md'), 'utf8')
const packaged = source
  .replaceAll('](.github/assets/', `](${raw}.github/assets/`)
  .replaceAll('src=".github/assets/', `src="${raw}.github/assets/`)
  .replaceAll('srcset=".github/assets/', `srcset="${raw}.github/assets/`)
  .replaceAll('src="apps/docs/public/', `src="${raw}apps/docs/public/`)
  .replaceAll('](LICENSE)', `](${blob}LICENSE)`)
  .replaceAll('](packages/nuxt-penumbra/CHANGELOG.md)', `](${blob}packages/nuxt-penumbra/CHANGELOG.md)`)
const target = join(root, 'packages/nuxt-penumbra/README.md')
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== packaged)
    throw new Error('packages/nuxt-penumbra/README.md is out of date. Run bun run sync:readme')
} else {
  writeFileSync(target, packaged)
}
