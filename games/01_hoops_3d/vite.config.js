import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        phase_01: resolve(__dirname, 'phases/phase_01_3d_mock/index.html'),
        phase_02: resolve(__dirname, 'phases/phase_02_1v1_defender/index.html'),
        phase_03: resolve(__dirname, 'phases/phase_03_2v1_pass_and_steal/index.html'),
        phase_04: resolve(__dirname, 'phases/phase_04_2v2_roster_and_fire/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
