import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    __DEV__: 'true',
  },
  server: {
    port: 5199,
  },
});
