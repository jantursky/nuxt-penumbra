# Contributing

Thanks for helping. Bug reports, docs fixes and pull requests are all welcome.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree on the approach.
- A transition that looks wrong in one browser may be a missing API there. Check the browser support of `document.startViewTransition` before you file a bug about the animation itself.
- The effects live in `@penumbra/core`. This module wires them to Nuxt, so an effect that draws wrong belongs there.

## Setup

You need [Bun](https://bun.sh) 1.3+ and Node.js 24 (the module supports Node 22.12 and newer, and CI runs on 24).

```sh
bun install
bunx playwright install chromium firefox webkit   # once, for the e2e tests
bun run dev                                       # the color-mode playground, reading the module's source
```

## Where things live

- `packages/nuxt-penumbra/src`: the module (`module.ts`) and its runtime (`runtime/`: controller, standalone store, head script, plugin, composable and `PenumbraToggle`).
- `packages/nuxt-penumbra/test`: unit tests (Vitest with happy-dom).
- `packages/nuxt-penumbra/scripts`: package checks, the packed tarball test and the size measurement.
- `apps/playground-color-mode`, `apps/playground-standalone`, `apps/playground-nuxt-ui`: one Nuxt app per mode, each with Playwright e2e tests in `e2e/`.
- `apps/demo`: the live demo, also covered by e2e tests.
- `apps/docs`: the docs site.
- `design/`: the design system. Every UI surface uses its tokens.

## Checks

```sh
bun run check            # format, typecheck, lint, unit tests with coverage
bun run build:lib        # the module, with @nuxt/module-builder
bun run lint:package     # after build: publint
bun run size             # after build: size-limit budgets
bun run test:pack        # after build: installs the tarball into fresh Nuxt 3 and Nuxt 4 projects
bun run test:e2e         # builds and drives every app with Playwright
bun run --filter docs build
```

`test:pack` runs both Nuxt majors by default. Set `NUXT_VERSION=3` or `NUXT_VERSION=4` to run one.

CI runs all of them on every pull request, and the pack test against Nuxt 3 and Nuxt 4. The unit tests need 100% coverage of `controller.ts`, `standalone.ts` and `head-script.ts`.

## Conventions

- TypeScript strict. Prettier formats everything (`bun run format`).
- Every behavior change comes with a test.
- Theme names, attributes and storage keys are validated in `module.ts`. Keep the validation there when you add an option.
- Add a line under `## [Unreleased]` in `packages/nuxt-penumbra/CHANGELOG.md` for anything users will notice.
- Breaking changes need a new major version and an entry under **Changed**.

## License

By contributing you agree that your contributions are licensed under the MIT license.
