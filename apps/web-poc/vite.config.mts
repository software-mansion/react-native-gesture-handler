import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import path from 'node:path';

// RGH_PACKED=1 consumes the vendored self-contained layout produced by
// scripts/vendor-for-pack.mjs instead of the workspace package — the runtime
// verification of the 2-package publishing option.
const packedAlias = process.env.RGH_PACKED
  ? {
      'react-gesture-handler': path.resolve(
        __dirname,
        '../../packages/react-gesture-handler/dist-pack/src/index.ts'
      ),
    }
  : {};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: packedAlias,
  },
  server: {
    port: 5199,
  },
});
