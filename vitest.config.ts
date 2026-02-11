import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
      css: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
