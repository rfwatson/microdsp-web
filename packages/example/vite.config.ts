import { defineConfig } from 'vite';

export default defineConfig({
  base: '/microdsp-web/',
  build: {
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: '[name].js',
        format: 'esm',
      },
    },
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
