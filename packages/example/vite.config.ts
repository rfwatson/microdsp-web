import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  build: {
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: '[name].js',
        format: 'esm',
      },
    },
    target: 'esnext',
    outDir: 'dist',
  },
});
