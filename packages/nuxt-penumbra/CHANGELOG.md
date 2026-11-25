# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.1]

### Fixed

- A theme change made right after `navigateTo()` or `router.push()` could start its own view transition just before Nuxt started the page transition. Chromium on Linux crashed the page when the two overlapped. A navigation now counts as running from the moment it is requested, so the theme change is applied without an effect, as intended.

### Changed

- Documentation: Nuxt 3.12.4, 3.21.11 and 4.7.0 were each built in server, `ssr: false` and `nuxt generate` modes, in both module modes, and toggled in Chromium. The compatibility notes now say what was checked and when, and no longer call the Nuxt 3 floor a guess.
- Added type tests for the public API and a browser check for every Nuxt version and render mode in CI. No runtime change.

## [1.0.0]

### Added

- Color-mode mode: animates changes to `@nuxtjs/color-mode`'s `preference` and never stores a theme itself. Chosen automatically when `@nuxtjs/color-mode` is installed.
- Standalone mode: a small built-in theme store for apps without `@nuxtjs/color-mode`. It keeps the visitor's choice in `localStorage`, follows `prefers-color-scheme` and other tabs, and sets a `data-*` attribute or a class on `<html>`. An inline head script applies the theme before first paint.
- `usePenumbra()`: `theme`, `preference`, `themes`, `setTheme` and `toggleTheme`, with per-call `transition`, `duration`, `easing`, `direction` and `origin` options.
- `<PenumbraToggle>`: a real button whose accessible name states the current and next theme, with a scoped slot, forced-colors styles and per-instance `themes`, `transition`, `duration`, `easing` and `direction`.
- `definePenumbraTransition()` to register a custom effect.
- 30 View Transitions effects from `penumbra-core`, an instant fallback where `document.startViewTransition` is missing.
- Nuxt UI support without wrappers: Nuxt UI's color mode is animated as it is.
- A navigation guard, so a theme change made while a page transition runs does not collide with it.
- Reduced-motion handling: with `prefers-reduced-motion: reduce` the theme changes without an effect.
- Module options: `mode`, `themes`, `transition`, `duration`, `easing`, and in standalone mode `default`, `attribute` and `storageKey`, validated at build time.
