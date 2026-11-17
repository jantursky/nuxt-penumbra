export const SYSTEM = 'system'

/** Set on `window` once the store has taken over from the head script's listeners. */
export const HEAD_OFF = '__penumbraStore'

export interface StandaloneConfig {
  themes: readonly string[]
  /** A theme name, or `'system'` to follow `prefers-color-scheme`. */
  default: string
  /** `'class'` toggles a class on `<html>`; `'data-*'` sets that attribute. */
  attribute: 'class' | `data-${string}`
  storageKey: string
}

/** The value that follows `prefers-color-scheme`. Needs the themes `light` and `dark`. */
export const supportsSystem = (themes: readonly string[]): boolean =>
  themes.includes('light') && themes.includes('dark')

/**
 * The script that runs in `<head>` before first paint, so the page never shows the wrong theme. It reads the same
 * storage key as the store below and keeps `<html>` in step with `prefers-color-scheme` and other tabs. Written by
 * hand and kept small: it ships in every page.
 */
export function buildHeadScript(config: StandaloneConfig): string {
  const data = JSON.stringify({
    t: config.themes,
    d: config.default,
    a: config.attribute,
    k: config.storageKey,
    s: supportsSystem(config.themes),
  }).replace(/</g, '\\u003c')
  return (
    `(function(w,d,c){var h=d.documentElement,m=w.matchMedia('(prefers-color-scheme: dark)');` +
    `function g(){var x;if(c.a=='class')c.t.forEach(function(t){h.classList.contains(t)&&(x=t)});` +
    `else x=h.getAttribute(c.a);return c.t.indexOf(x)>-1&&x}` +
    `function p(){var v;try{v=localStorage.getItem(c.k)}catch(e){v=g()}` +
    `return v&&(v=='system'?c.s:c.t.indexOf(v)>-1)?v:c.d}` +
    `function r(){var v=p();return v=='system'?m.matches?'dark':'light':v}` +
    `function a(){var t=r();if(c.a=='class')c.t.forEach(function(x){h.classList.toggle(x,x==t)});` +
    `else h.setAttribute(c.a,t)}` +
    `a();m.addEventListener('change',function(){!w.${HEAD_OFF}&&p()=='system'&&a()});` +
    `w.addEventListener('storage',function(e){!w.${HEAD_OFF}&&(!e.key||e.key==c.k)&&a()})` +
    `})(window,document,${data})`
  )
}
