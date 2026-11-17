<script setup lang="ts">
definePageMeta({ layout: 'ui' })
useHead({ title: 'Nuxt UI' })
</script>

<template>
  <div>
    <p class="aside">No wrapper needed</p>
    <h1 class="display">Nuxt UI</h1>
    <p class="lede">
      Nuxt UI's own colour mode components write to the colour mode, and nuxt-penumbra animates that write. Nothing here
      passes an origin or an effect: the circle still opens from your click.
    </p>

    <ul class="section grid">
      <li class="card stack">
        <h2 class="heading">Button</h2>
        <UColorModeButton color="neutral" variant="outline" data-testid="ui-button" />
        <CodeBlock label="UColorModeButton" code="<UColorModeButton />" />
      </li>
      <li class="card stack">
        <h2 class="heading">Switch</h2>
        <UColorModeSwitch color="neutral" data-testid="ui-switch" />
        <CodeBlock label="UColorModeSwitch" code="<UColorModeSwitch />" />
      </li>
      <li class="card stack">
        <h2 class="heading">Select</h2>
        <UColorModeSelect color="neutral" data-testid="ui-select" />
        <CodeBlock label="UColorModeSelect" code="<UColorModeSelect />" />
      </li>
    </ul>

    <section class="section card" aria-labelledby="scope">
      <h2 id="scope" class="heading">Scoped on purpose</h2>
      <p class="label scope">
        Tailwind and Nuxt UI load only for this page's layout, in cascade layers and without Tailwind's reset. The
        dashboard keeps its own look.
      </p>
    </section>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--space-4);
  padding: 0;
  list-style: none;
}

.stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  justify-items: start;
  gap: var(--space-4);
  min-width: 0;
}

.stack > :last-child {
  justify-self: stretch;
}

.scope {
  margin-top: var(--space-3);
}
</style>
