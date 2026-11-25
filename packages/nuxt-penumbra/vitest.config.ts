import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    typecheck: { enabled: true, include: ['test/**/*.test-d.ts'], tsconfig: './tsconfig.json' },
    coverage: {
      provider: 'v8',
      include: [
        'src/runtime/controller.ts',
        'src/runtime/standalone.ts',
        'src/runtime/head-script.ts',
        'src/validate.ts',
      ],
      reporter: ['text-summary', 'text', 'html', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
