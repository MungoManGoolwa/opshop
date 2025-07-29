/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./client/src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    include: ['client/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'server/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['client/src/**/*'],
      exclude: [
        'node_modules/',
        'client/src/test/',
        'server/test/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
})