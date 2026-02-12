import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
      css: true,
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'lcov'],
        include: ['src/lib/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
        exclude: [
          '**/*.test.*',
          '**/*.d.ts',
          'src/lib/ai.ts',
          'src/lib/enhanced-ai.ts',
          'src/lib/local-ai.ts',
        ],
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
