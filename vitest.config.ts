import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      all: true,
      enabled: true,
      include: ['src/**/*.ts'],
      reporter: ['lcov', 'text']
    },
    include: ['specs/**/*.spec.ts']
  }
});
