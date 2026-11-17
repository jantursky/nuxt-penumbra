# Security policy

## Supported versions

Only the latest release of `nuxt-penumbra` gets fixes.

## Reporting a vulnerability

Please don't open a public issue. Use GitHub's [private vulnerability reporting](https://github.com/jantursky/nuxt-penumbra/security/advisories/new), or email jan.tursky@gmail.com with a description and, if you can, a minimal reproduction.

You'll get an answer within a week. Once a fix is released, the advisory is published with credit, unless you'd rather stay anonymous.

Issues in Nuxt itself should go to the [Nuxt repository](https://github.com/nuxt/nuxt/security).

## Things to know

- In standalone mode the head script is built from your validated config. Theme names must match `/^[a-z][a-z0-9-]*$/i` (letters, digits and dashes, starting with a letter); `attribute` must be `class` or `data-*`; and the config is JSON-encoded with `<` escaped, so it can't close the script tag.
- No user HTML is injected. The module writes only theme names to the `class` or `data-*` attribute of `<html>`.
- The value read from `localStorage` is checked against the configured themes (and `system`) before it is used, and so are the contents of the cookie that `@nuxtjs/color-mode` sets. Anything else falls back to the default.
- The standalone head script is an inline script, so a Content Security Policy that forbids inline scripts will block it. Allow it with a hash or a nonce. In `@nuxtjs/color-mode` mode the module adds no inline script of its own.
- Standalone mode stores only the theme name the visitor picked (or `system`) in `localStorage`, under the key you configure. In `@nuxtjs/color-mode` mode the module stores nothing; that module does.
- The module makes no network requests and sets no cookies.
