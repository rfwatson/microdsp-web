import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
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
