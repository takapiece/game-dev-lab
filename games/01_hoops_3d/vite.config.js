import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        phase_01: resolve(__dirname, 'phases/phase_01_3d_mock/index.html'),
        phase_02: resolve(__dirname, 'phases/phase_02_1v1_defender/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
