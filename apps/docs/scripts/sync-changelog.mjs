// Copies the module's CHANGELOG.md into docs/_generated/changelog.md without its first heading,
// so the page title comes from docs/changelog.mdx. Runs before every dev and build.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const source = new URL('../../../packages/nuxt-penumbra/CHANGELOG.md', import.meta.url)
const target = new URL('../docs/_generated/changelog.md', import.meta.url)

mkdirSync(new URL('../docs/_generated/', import.meta.url), { recursive: true })

if (existsSync(source)) {
  // Drop the "# Changelog" line and the blank line after it.
  const lines = readFileSync(source, 'utf8').split('\n')
  writeFileSync(target, lines.slice(2).join('\n'))
} else {
  writeFileSync(target, 'The changelog is not available yet.\n')
  console.warn('sync-changelog: packages/nuxt-penumbra/CHANGELOG.md not found, wrote a placeholder.')
}
