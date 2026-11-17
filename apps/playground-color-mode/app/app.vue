<script setup lang="ts">
const { theme, preference, toggleTheme, setTheme } = usePenumbra()
const effects = ['circle', 'circle-inverse', 'wipe', 'fade']
</script>

<template>
  <div class="page">
    <header>
      <nav aria-label="Main">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
      <p>
        theme: <b data-testid="theme">{{ theme }}</b> / preference: <b data-testid="preference">{{ preference }}</b>
      </p>
      <button data-testid="toggle" @click="(event) => toggleTheme({ origin: event })">Toggle</button>
      <button
        v-for="effect in effects"
        :key="effect"
        :data-testid="`toggle-${effect}`"
        @click="(event) => toggleTheme({ transition: effect, origin: event })"
      >
        {{ effect }}
      </button>
      <button data-testid="set-dark" @click="setTheme('dark')">Dark</button>
      <button data-testid="set-light" @click="setTheme('light')">Light</button>
      <button data-testid="raw-dark" @click="useColorMode().preference = 'dark'">Raw dark</button>
      <PenumbraToggle data-testid="penumbra-toggle" transition="wipe" />
    </header>
    <main><NuxtPage /></main>
  </div>
</template>

<style>
:root {
  --bg: #fff;
  --fg: #111;
}
:root.dark {
  --bg: #111;
  --fg: #fff;
}
body {
  background: var(--bg);
  color: var(--fg);
  margin: 0;
  font-family: system-ui, sans-serif;
}
.page {
  padding: 2rem;
  min-height: 100vh;
}
a {
  color: inherit;
}
button {
  margin: 0 0.5rem 0.5rem 0;
}
</style>
