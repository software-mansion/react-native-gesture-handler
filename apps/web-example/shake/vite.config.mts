// Library-cost measurement config for the tree-shaking rig: builds one entry
// (SHAKE_ENTRY=tap-only|full) as a minified ES lib with react externalized,
// so the output size is the gesture-handler cost alone.
//   yarn vite build --config shake/vite.config.mts
import { defineConfig } from 'vite';
import path from 'node:path';

const entry = process.env.SHAKE_ENTRY ?? 'tap-only';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, `${entry}.ts`),
      formats: ['es'],
      fileName: entry,
    },
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false,
    minify: 'esbuild',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
