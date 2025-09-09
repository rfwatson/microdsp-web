import { defineConfig } from 'vite';
import path from 'path';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'mpm-web',
      formats: ['es'],
    },
    target: 'esnext',
    outDir: 'dist',
  },
});
