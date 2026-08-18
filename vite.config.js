import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages のリポジトリ名に依存せず、各HTMLから相対参照できる形で出力します。
  base: './',
  build: {
    rollupOptions: {
      input: {
        portal: resolve(__dirname, 'index.html'),
        hoops: resolve(__dirname, 'games/01_hoops_3d/index.html'),
        hoopsDashboard: resolve(__dirname, 'games/01_hoops_3d/dashboard/index.html'),
        hoopsPhase01: resolve(__dirname, 'games/01_hoops_3d/phases/phase_01_3d_mock/index.html'),
        hoopsPhase02: resolve(__dirname, 'games/01_hoops_3d/phases/phase_02_1v1_defender/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
