<script setup lang="ts">
import type { RevenuePoint } from '../data/northwind'

const props = defineProps<{ points: RevenuePoint[] }>()

const WIDTH = 600
const HEIGHT = 260
const PAD = { left: 40, right: 12, top: 12, bottom: 32 }
const STEP = 20

const top = computed(() => Math.ceil(Math.max(...props.points.map((point) => point.value)) / STEP) * STEP)
const ticks = computed(() => Array.from({ length: top.value / STEP + 1 }, (_, index) => index * STEP))
const x = (index: number): number => PAD.left + (index * (WIDTH - PAD.left - PAD.right)) / (props.points.length - 1)
const y = (value: number): number => PAD.top + (1 - value / top.value) * (HEIGHT - PAD.top - PAD.bottom)

const line = computed(() =>
  props.points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(point.value)}`).join(' '),
)
const area = computed(() => `${line.value} L${x(props.points.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`)
const summary = computed(() => {
  const first = props.points[0]
  const last = props.points[props.points.length - 1]
  return `Monthly revenue in thousands of dollars: ${first?.value} in ${first?.label}, ${last?.value} in ${last?.label}.`
})
</script>

<template>
  <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" role="img" :aria-label="summary" class="chart">
    <g v-for="tick in ticks" :key="tick">
      <line :x1="PAD.left" :x2="WIDTH - PAD.right" :y1="y(tick)" :y2="y(tick)" class="grid" />
      <text :x="PAD.left - 8" :y="y(tick)" class="tick" text-anchor="end" dominant-baseline="middle">{{ tick }}</text>
    </g>
    <path :d="area" class="area" />
    <path :d="line" class="line" pathLength="1" />
    <circle v-for="(point, index) in points" :key="point.label" :cx="x(index)" :cy="y(point.value)" r="4" class="dot" />
    <text
      v-for="(point, index) in points"
      :key="`label-${point.label}`"
      :x="x(index)"
      :y="HEIGHT - 8"
      class="tick"
      text-anchor="middle"
    >
      {{ point.label }}
    </text>
  </svg>
</template>

<style scoped>
.chart {
  display: block;
  width: 100%;
  height: auto;
}

.grid {
  stroke: var(--border);
  stroke-width: 1;
}

.tick {
  fill: var(--text-muted);
  font: 500 16px var(--font-body);
}

.area {
  fill: var(--accent);
  fill-opacity: 0.35;
}

.line {
  fill: none;
  stroke: var(--text);
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-dasharray: 1;
}

.dot {
  fill: var(--accent);
  stroke: var(--text);
  stroke-width: 2;
}

@media (prefers-reduced-motion: no-preference) {
  .line {
    animation: draw 0.9s ease-out;
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
}
</style>
