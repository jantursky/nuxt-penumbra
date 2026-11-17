<script setup lang="ts">
useHead({ title: 'Transitions' })

const { toggleTheme } = usePenumbra()
const systemReduces = useSystemReducedMotion()

const effect = ref<string>(EFFECTS[0])
const duration = ref(600)
const easing = ref<string>(EASINGS[0])
const direction = ref<DirectionName>('right')
const origin = ref<OriginChoice>('click')
const reducedMotion = ref(false)

const directional = computed(() => DIRECTIONAL.includes(effect.value))
// The simulation works by asking for no animation: a duration of 0 takes the instant path.
const effectiveDuration = computed(() => (reducedMotion.value ? 0 : duration.value))
const snippets = computed(() =>
  buildSnippets({
    effect: effect.value,
    duration: effectiveDuration.value,
    easing: easing.value,
    direction: direction.value,
    origin: origin.value,
  }),
)

function run(event: MouseEvent): void {
  toggleTheme({
    transition: effect.value,
    duration: effectiveDuration.value,
    easing: easing.value,
    direction: direction.value,
    origin: origin.value === 'click' ? event : 'center',
  })
}
</script>

<template>
  <div>
    <p class="aside">Fifteen ways to switch</p>
    <h1 class="display">Transitions</h1>
    <p class="lede">
      Pick an effect, tune it, and run it on this very page. The code on the right is what you would write to get
      exactly this.
    </p>

    <div class="section layout">
      <section class="card controls" aria-labelledby="controls">
        <h2 id="controls" class="heading">Controls</h2>
        <EffectPicker v-model="effect" :effects="EFFECTS" />

        <div class="field">
          <label for="duration" class="label">Duration</label>
          <input id="duration" v-model.number="duration" type="range" min="100" max="2000" step="50" />
          <output for="duration" class="label">{{ duration }} ms</output>
        </div>
        <div class="field">
          <label for="easing" class="label">Easing</label>
          <select id="easing" v-model="easing">
            <option v-for="option in EASINGS" :key="option">{{ option }}</option>
          </select>
        </div>
        <div class="field">
          <label for="direction" class="label">Direction (wipe and blinds)</label>
          <select id="direction" v-model="direction" :disabled="!directional">
            <option v-for="option in DIRECTIONS" :key="option">{{ option }}</option>
          </select>
        </div>
        <div class="field">
          <label for="origin" class="label">Origin</label>
          <select id="origin" v-model="origin">
            <option value="click">Click point</option>
            <option value="center">Centre of the screen</option>
          </select>
        </div>
        <div class="field">
          <label class="switch label">
            <input v-model="reducedMotion" type="checkbox" role="switch" />
            Simulate reduced motion
          </label>
          <p class="label note">
            Sets the duration to 0, which takes the same instant path as the system setting. Your own system setting
            wins: with "Reduce motion" turned on, every effect here is skipped whatever this switch says.
            {{ systemReduces ? 'Your system asks for reduced motion.' : 'Your system has no preference.' }}
          </p>
        </div>

        <button type="button" class="btn run" data-testid="run" @click="run">Run the transition</button>
        <p class="label note">The effect covers the whole page, not this card.</p>
      </section>

      <section class="source" aria-labelledby="source">
        <h2 id="source" class="heading">Source</h2>
        <CodeBlock :label="origin === 'click' ? 'Component' : 'Call'" :code="snippets.usage" />
        <CodeBlock label="nuxt.config.ts" :code="snippets.config" />
        <p class="label note">
          Direction and origin are per call: they are not config options. The component reveals from the click.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.controls,
.source {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  min-width: 0;
}

.source {
  gap: var(--space-4);
}

.field {
  display: grid;
  gap: var(--space-2);
}

.note {
  font-size: 14px;
}

select {
  padding: var(--space-2) var(--space-4);
  background: var(--surface-raised);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-button);
  font: 500 14px/1.4 var(--font-body);
}

select:disabled {
  color: var(--text-muted);
}

input {
  accent-color: var(--text);
}

input[type='range'] {
  width: 100%;
}

select:focus-visible,
input:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.switch {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text);
}

.run {
  justify-self: start;
}
</style>
