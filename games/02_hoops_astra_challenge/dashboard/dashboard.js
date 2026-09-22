document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      panes.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const activePane = document.getElementById(`tab-${target}`);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });

  // Gate Details Data
  const gateDetails = {
    g0: {
      tag: 'GATE 0: PHYSICAL CORE',
      title: '物理コア & シュート判定の確立',
      subtitle: 'プレースホルダー（CubeとSphere）だけで成立させる最小の動く核',
      goal: '見た目や演出をすべて後回しにし、「ボールが放物線を描いて飛び、リングを上から通過したら得点になる」というコアゲームループだけを確実に成立させる。',
      constraint: '人型キャラクターや背景アセットは一切配置してはならない。CubeとSphereのみで構築し、テストが合格するまで素材統合を行わない。',
      acceptance: '連続投球を行い、Green Release（良いタイミング）の判定と、物理的なリング通過による得点加算が100%連動して動作すること。',
      lesson: '初心者が最も陥りやすい「最初からキャラクターや背景を置いて動かなくなる」罠を防ぐ。「動く最小単位（MVP）」を最初に作ることが、AI開発でも人間の開発でも最重要原則。'
    },
    g1: {
      tag: 'GATE 1: HUMANOID INTEGRATION',
      title: '人型モデル & アニメーション接続',
      subtitle: 'Mixamo・CC0素材の統合と、手と球の同期制御',
      goal: '四角いプレースホルダーを人型3Dモデルに差し替え、移動・自動ドリブル・跳躍シュートのアニメーションを物理挙動と接続する。',
      constraint: 'アニメーションの再生と同時にボールを手元にアタッチ（追従）させ、最高到達点でデタッチ（物理発射）するタイミング制御をスクリプトで厳密に管理する。',
      acceptance: '走る・止まる・ドリブルする一連の動作が不自然な滑りなく動作し、シュートボタンの長押し・離す操作で跳躍投球が行われること。',
      lesson: '「アニメーションの見た目」と「物理エンジンの座標」は別物。ゲーム開発では、この2つをどのタイミングで手放し・受け渡すかの設計（アタッチ/デタッチ）が肝となる。'
    },
    g2: {
      tag: 'GATE 2: 4 WORLDS EXPANSION',
      title: '4つの世界（ステージ）と環境演出の連続性',
      subtitle: 'Street → Gym → Arena → Neon のシームレスな移行',
      goal: '1つのコートだけでなく、世界観の異なる4つのコート（屋外ストリート、高校体育館、プロアリーナ、近未来ネオン）を巡るゲーム体験を構築する。',
      constraint: '各コートごとに3本シュート成功で次ステージへ移行。ワールドごとにコート床材の摩擦・跳ね返り、専用BGM、歓声エフェクト、プレイヤーの衣装マテリアルを切り替える。',
      acceptance: 'StreetからNeonまで、エラーやメモリリークなく4ステージが連続して遊べ、最終ステージクリア時にリザルトが表示されること。',
      lesson: '「1つの仕組みが完成したら、データや演出のバリエーションを増やして厚みを出す」。ゲームの飽きさせないレベルデザインの基礎を学ぶ。'
    },
    g3: {
      tag: 'GATE 3: MOBILE & WEBGL DEPLOYMENT',
      title: 'スマホ横持ち操作 & WebGL配信（itch.io）',
      subtitle: '作ったゲームを誰でも遊べる形へ届ける最終出荷',
      goal: 'PCのキーボード操作だけでなく、スマートフォンのブラウザで横持ち（ランドスケープ）で快適に遊べるバーチャル操作とWebGLビルドを完成させる。',
      constraint: 'ブラウザの自動音声再生禁止（Autoplay Policy）による音ズレ対策、約49MB以内の軽量アセット最適化、タッチ領域の誤爆防止。',
      acceptance: 'スマホおよびPCのブラウザからURLを開くだけで即座にプレイ可能であり、タッチで移動とシュートができること。',
      lesson: 'ゲームは作って終わりではなく「遊んでもらう」までが開発。Webブラウザ（WebGL）やモバイルに移植する際の制約と最適化の技術を身につける。'
    }
  };

  function renderGateDetail(gateKey) {
    const detailContainer = document.getElementById('gate-detail-view');
    if (!detailContainer) return;

    const data = gateDetails[gateKey] || gateDetails.g0;
    detailContainer.innerHTML = `
      <div class="gate-detail-card">
        <div class="gate-detail-badge">${data.tag}</div>
        <h3 class="gate-detail-title">${data.title}</h3>
        <p class="gate-detail-subtitle">${data.subtitle}</p>

        <div class="gate-grid-details">
          <div class="detail-box">
            <span class="detail-box-label">🎯 このゲートの目的 (Goal)</span>
            <p>${data.goal}</p>
          </div>
          <div class="detail-box alert-box">
            <span class="detail-box-label">⛔ AIへの制約ルール (Constraint)</span>
            <p>${data.constraint}</p>
          </div>
          <div class="detail-box">
            <span class="detail-box-label">🧪 受入試験・合格基準 (Acceptance)</span>
            <p>${data.acceptance}</p>
          </div>
          <div class="detail-box highlight-box">
            <span class="detail-box-label">💡 生徒への教育的学び (Lesson)</span>
            <p>${data.lesson}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Initial render
  renderGateDetail('g0');

  // Gate Card Selection
  const gateCards = document.querySelectorAll('.gate-card');
  gateCards.forEach((card) => {
    card.addEventListener('click', () => {
      gateCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      const gateKey = card.dataset.gate;
      renderGateDetail(gateKey);

      // 概要タブをアクティブにして、選択ゲートの説明へ誘導
      const overviewTab = document.querySelector('[data-tab="overview"]');
      if (overviewTab && !overviewTab.classList.contains('active')) {
        overviewTab.click();
      }
    });
  });
});
