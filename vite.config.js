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
        hoopsPhase03: resolve(__dirname, 'games/01_hoops_3d/phases/phase_03_2v1_pass_and_steal/index.html'),
        hoopsPhase04: resolve(__dirname, 'games/01_hoops_3d/phases/phase_04_2v2_roster_and_fire/index.html'),
        hoopsWorldTourDashboard: resolve(__dirname, 'games/02_hoops_astra_challenge/dashboard/index.html'),
        snippet01: resolve(__dirname, 'snippets/01_button_screen_transition/index.html'),
        snippet01Next: resolve(__dirname, 'snippets/01_button_screen_transition/next_page.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
